package com.example.apartmentmanagement.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "meter_rate")
@Data
public class MeterRate {

    @Id
    private String type;

    private Double rate;

    private LocalDateTime timestamp;
}

