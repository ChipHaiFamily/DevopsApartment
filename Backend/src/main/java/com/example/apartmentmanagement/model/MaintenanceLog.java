package com.example.apartmentmanagement.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceLog {
    @Id
    @Column(length = 20)
    private String logId;

    private LocalDate requestDate;
    private LocalDate completedDate;
    private String logType;
    private String description;
    private String status;
    private String technician;
    private double cost;

    @ManyToOne
    @JoinColumn(name = "room_num")
    private Room room;
}
