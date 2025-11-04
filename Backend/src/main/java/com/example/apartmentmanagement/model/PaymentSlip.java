package com.example.apartmentmanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_slips")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentSlip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long slipId;

    @Column(nullable = false)
    private String paymentId;

    @Lob
    @Column(nullable = false)
    private byte[] slipData;

    private String fileName;
    private String mimeType;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
