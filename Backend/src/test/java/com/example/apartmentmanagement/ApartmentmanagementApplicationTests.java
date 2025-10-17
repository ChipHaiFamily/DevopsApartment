package com.example.apartmentmanagement;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootApplication(exclude = {
    org.springframework.boot.actuate.autoconfigure.metrics.SystemMetricsAutoConfiguration.class,
    org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryAutoConfiguration.class
})
public class ApartmentManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApartmentManagementApplication.class, args);
    }
}
