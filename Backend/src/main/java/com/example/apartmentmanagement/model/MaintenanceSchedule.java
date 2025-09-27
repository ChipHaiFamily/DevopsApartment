package com.example.apartmentmanagement.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance_schedule")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceSchedule {
    @Id
    @Column(length = 20)
    private String scheduleId;

    private String taskName;
    private String cycleInterval;
    private LocalDate lastCompleted;
    private LocalDate nextDue;
}
