package com.example.apartmentmanagement.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "meters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meter {

    @Id
    @Column(length = 30)
    private String meterId;

    @Column(nullable = false)
    private String room;

    @Column(nullable = false, length = 7)
    private String period;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private int unit;

    @Column(name = "record_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate recordDate;

}
