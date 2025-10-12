package com.example.apartmentmanagement;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@ActiveProfiles("test") 
class ApartmentmanagementApplicationTests {

    @Test
    void main_runsWithoutException() {
        ApartmentManagementApplication.main(new String[]{});
    }
}
