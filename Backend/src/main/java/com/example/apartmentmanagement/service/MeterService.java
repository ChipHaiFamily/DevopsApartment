package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.MeterInvoiceDto;
import com.example.apartmentmanagement.model.Contract;
import com.example.apartmentmanagement.model.Meter;
import com.example.apartmentmanagement.model.MeterRate;
import com.example.apartmentmanagement.model.Room;
import com.example.apartmentmanagement.repository.ContractRepository;
import com.example.apartmentmanagement.repository.MeterRateRepository;
import com.example.apartmentmanagement.repository.MeterRepository;
import com.example.apartmentmanagement.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeterService {

    private final MeterRepository repository;
    private final MeterRateRepository meterRateRepository;
    private final ContractRepository contractRepository;
    private final IdGenerationService idGenerationService;

    public List<Meter> getAllMeters() {
        return repository.findAll();
    }

    public MeterInvoiceDto getMetersForRoomAndMonth(String roomNum, String month) {
        List<Meter> meters = repository.findByRoomAndPeriod(roomNum, month);
        if (meters.isEmpty()) return null;

        List<MeterInvoiceDto.MeterDetail> meterDetails = meters.stream()
                .map(m -> MeterInvoiceDto.MeterDetail.builder()
                        .type(m.getType())
                        .unit(m.getUnit())
                        .build())
                .toList();

        return MeterInvoiceDto.builder()
                .room(roomNum)
                .latestMeters(meterDetails)
                .build();
    }

    public MeterInvoiceDto getLatestMetersWithRoomPrice(String room) {
        List<Meter> meters = repository.findByRoomOrderByRecordDateDesc(room);
        Map<String, Meter> latestByType = meters.stream()
                .collect(Collectors.toMap(
                        Meter::getType,
                        m -> m,
                        (m1, m2) -> m1
                ));

        Contract contract = contractRepository.findByRoom_RoomNumOrderByEndDateDesc(room);

        Map<String, MeterRate> latestRates = meterRateRepository.findLatestRatesForAllTypes()
                .stream()
                .collect(Collectors.toMap(MeterRate::getType, rate -> rate));

        List<MeterInvoiceDto.MeterDetail> meterDetails = latestByType.values().stream()
                .map(meter -> {
                    MeterRate rate = latestRates.get(meter.getType());
                    BigDecimal totalBill = rate != null
                            ? BigDecimal.valueOf(meter.getUnit()).multiply(BigDecimal.valueOf(rate.getRate()))
                            : BigDecimal.ZERO;

                    return MeterInvoiceDto.MeterDetail.builder()
                            .meterId(meter.getMeterId())
                            .room(meter.getRoom())
                            .period(meter.getPeriod())
                            .type(meter.getType())
                            .unit(meter.getUnit())
                            .totalBill(totalBill)
                            .recordDate(meter.getRecordDate())
                            .build();
                })
                .collect(Collectors.toList());

        return MeterInvoiceDto.builder()
                .room(room)
                .roomPrice(contract != null ? BigDecimal.valueOf(contract.getRentAmount()) : BigDecimal.ZERO)
                .latestMeters(meterDetails)
                .build();
    }


    public Meter addMeter(String room, String type, int unit, LocalDate recordDate, String period) {
        if (period == null || period.isBlank()) {
            period = recordDate.getYear() + "-" + String.format("%02d", recordDate.getMonthValue());
        }

        Meter existingMeter = repository.findByRoomAndPeriodAndTypeAndRecordDate(room, period, type, recordDate);

        if (existingMeter != null) {
            existingMeter.setUnit(unit);

            return repository.save(existingMeter);
        }

        Meter lastMeter = repository.findTopByPeriodAndRoomOrderByMeterIdDesc(period, room);
        String lastId = lastMeter != null ? lastMeter.getMeterId() : null;

        String meterId = idGenerationService.generateMeterId(room, period, lastId);

        Meter meter = new Meter();
        meter.setMeterId(meterId);
        meter.setRoom(room);
        meter.setType(type);
        meter.setUnit(unit);
        meter.setPeriod(period);
        meter.setRecordDate(recordDate);

        return repository.save(meter);
    }

    public void importMetersFromCsv(MultipartFile file) throws Exception {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                    .withFirstRecordAsHeader()
                    .withIgnoreHeaderCase()
                    .withTrim());

            for (CSVRecord record : csvParser) {
                String room = record.get("room");
                String type = record.get("type");
                int unit = Integer.parseInt(record.get("unit"));
                LocalDate recordDate = LocalDate.parse(record.get("recordDate"));
                String period = record.get("period");

                addMeter(room, type, unit, recordDate, period);
            }
        }
    }

}
