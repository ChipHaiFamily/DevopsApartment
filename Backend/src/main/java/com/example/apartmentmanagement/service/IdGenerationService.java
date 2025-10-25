package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.*;
import com.example.apartmentmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class IdGenerationService {

    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final MaintenanceScheduleRepository mtncSchRepository;
    private final MaintenanceLogRepository mtncLogRepository;
    private final ContractRepository contractRepository;
    private final SuppliesRepository suppliesRepository;
    private final SuppliesHistoryRepository suppliesHistoryRepository;

    private String generateYearId(String prefix, String lastId, int year) {
        if (lastId == null || !lastId.contains(String.valueOf(year))) {
            return String.format("%s-%d-%03d", prefix, year, 1);
        }
        int num = Integer.parseInt(lastId.substring(lastId.lastIndexOf("-") + 1));
        return String.format("%s-%d-%03d", prefix, year, num + 1);
    }

    private String generateYearMonthId(String prefix, String lastId, int year, int month) {
        String ym = String.format("%d-%02d", year, month);
        if (lastId == null || !lastId.contains(ym)) {
            return String.format("%s-%s-%03d", prefix, ym, 1);
        }
        int num = Integer.parseInt(lastId.substring(lastId.lastIndexOf("-") + 1));
        return String.format("%s-%s-%03d", prefix, ym, num + 1);
    }

    private String generateSequentialId(String prefix, String lastId) {
        if (lastId == null || lastId.isEmpty()) {
            return String.format("%s-001", prefix);
        }
        String[] parts = lastId.split("-");
        int num;
        try {
            num = Integer.parseInt(parts[parts.length - 1]);
        } catch (NumberFormatException e) {
            num = 0;
        }
        return String.format("%s-%03d", prefix, num + 1);
    }

    public String generateUserId() {
        String lastId = userRepository.findTopByOrderByIdDesc()
                .map(User::getId)
                .orElse(null);
        return generateSequentialId("USR", lastId);
    }

    public String generateSupplyId() {
        String lastId = suppliesRepository.findTopByOrderByItemIdDesc()
                .map(Supplies::getItemId)
                .orElse(null);
        return generateSequentialId("ITM", lastId);
    }

    public String generateMeterId(String room, String period, String lastId) {
        String prefix = "MTR-" + period + "-" + room;
        if (lastId == null) {
            return prefix + "-01"; // เริ่มต้นเลข 01
        }
        int num = Integer.parseInt(lastId.substring(lastId.lastIndexOf("-") + 1));
        return String.format("%s-%02d", prefix, num + 1);
    }



    public String generateReservationId() {
        int year = LocalDate.now().getYear();
        String lastId = reservationRepository.findTopByOrderByReservationNumDesc()
                .map(Reservation::getReservationNum)
                .orElse(null);
        return generateYearId("RSV", lastId, year);
    }

    public String generatePaymentId() {
        LocalDate now = LocalDate.now();
        String lastId = paymentRepository.findTopByOrderByPaymentIdDesc()
                .map(Payment::getPaymentId)
                .orElse(null);
        return generateYearMonthId("PAY", lastId, now.getYear(), now.getMonthValue());
    }

    public String generateInvoiceId() {
        LocalDate now = LocalDate.now();
        String lastId = invoiceRepository.findTopByOrderByInvoiceIdDesc()
                .map(Invoice::getInvoiceId)
                .orElse(null);
        return generateYearMonthId("INV", lastId, now.getYear(), now.getMonthValue());
    }

    public String generateSupplyHistoryId() {
        LocalDate now = LocalDate.now();
        String lastId = suppliesHistoryRepository.findTopByOrderByHistoryIdDesc()
                .map(SuppliesHistory::getHistoryId)
                .orElse(null);
        return generateYearMonthId("HIT", lastId, now.getYear(), now.getMonthValue());
    }

    public String generateMtncSchId() {
        int year = LocalDate.now().getYear();
        String lastId = mtncSchRepository.findTopByOrderByScheduleIdDesc()
                .map(MaintenanceSchedule::getScheduleId)
                .orElse(null);
        return generateYearId("MS", lastId, year);
    }

    public String generateMtncLogId() {
        int year = LocalDate.now().getYear();
        String lastId = mtncLogRepository.findTopByOrderByLogIdDesc()
                .map(MaintenanceLog::getLogId)
                .orElse(null);
        return generateYearId("ML", lastId, year);
    }

    public String generateContractId() {
        int year = LocalDate.now().getYear();
        String lastId = contractRepository.findTopByOrderByContractNumDesc()
                .map(Contract::getContractNum)
                .orElse(null);
        return generateYearId("CTR", lastId, year);
    }
}
