package com.example.apartmentmanagement.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "supplies_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuppliesHistory {

    @Id
    @Column(name = "history_id", length = 20)
    private String historyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Supplies itemId;
    private String item_Name;
    private Integer quantity;
    @Column(name = "history_date", nullable = false)
    private LocalDate date;
    private String operator;
    private String action;

    @JsonProperty("itemId")
    public String getItemIdValue() {
        return itemId != null ? itemId.getItemId() : null;
    }

    @JsonProperty("itemId")
    public void setItemIdByString(String itemId) {
        if (itemId != null) {
            this.itemId = new Supplies();
            this.itemId.setItemId(itemId);
        }
    }
}
