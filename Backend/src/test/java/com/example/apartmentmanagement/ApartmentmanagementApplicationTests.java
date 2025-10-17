package com.example.apartmentmanagement;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.autoconfigure.metrics.SystemMetricsAutoConfiguration;

@SpringBootTest(
    properties = "spring.profiles.active=test",
    classes = ApartmentManagementApplication.class
)
class ApartmentmanagementApplicationTests {

    @Test
    void contextLoads() {
    }
}
