package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.Meter;
import com.example.apartmentmanagement.repository.MeterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MeterService {

    private final MeterRepository repository;
    private final IdGenerationService idGenerationService;

    public List<Meter> getAllMeters() {
        return repository.findAll();
    }
    // TODO
    public Meter addMeter(String room, String type, int unit, LocalDate recordDate, String period) {
        if (period == null || period.isBlank()) {
            period = recordDate.getYear() + "-" + String.format("%02d", recordDate.getMonthValue());
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
