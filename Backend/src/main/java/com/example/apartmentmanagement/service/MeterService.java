package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.Meter;
import com.example.apartmentmanagement.repository.MeterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    public Meter addMeter(String room, String type, int unit, LocalDate recordDate) {
        String period = recordDate.getYear() + "-" + String.format("%02d", recordDate.getMonthValue());

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

}
