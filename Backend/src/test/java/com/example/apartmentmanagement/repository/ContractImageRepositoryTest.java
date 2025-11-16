package com.example.apartmentmanagement.repository;

import com.example.apartmentmanagement.model.ContractImage;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ContractImageRepositoryTest {

    @Autowired
    private ContractImageRepository contractImageRepository;

    @Autowired
    private EntityManager entityManager;

    private ContractImage image1;
    private ContractImage image2;
    private ContractImage image3;

    @BeforeEach
    void setUp() {
        contractImageRepository.deleteAll(); // เคลียร์ database ก่อน

        byte[] dummyData1 = new byte[]{1, 2, 3};
        byte[] dummyData2 = new byte[]{4, 5, 6};
        byte[] dummyData3 = new byte[]{7, 8, 9};

        image1 = new ContractImage();
        image1.setContractNum("CTR-2025-001");
        image1.setImageType("id_card");
        image1.setImageData(dummyData1);
        image1.setFileName("id_card_1.jpg");
        image1.setMimeType("image/jpeg");
        image1.setUploadedAt(LocalDateTime.now());

        image2 = new ContractImage();
        image2.setContractNum("CTR-2025-001");
        image2.setImageType("contract_scan");
        image2.setImageData(dummyData2);
        image2.setFileName("contract_scan_1.pdf");
        image2.setMimeType("application/pdf");
        image2.setUploadedAt(LocalDateTime.now());

        image3 = new ContractImage();
        image3.setContractNum("CTR-2025-002");
        image3.setImageType("id_card");
        image3.setImageData(dummyData3);
        image3.setFileName("id_card_2.jpg");
        image3.setMimeType("image/jpeg");
        image3.setUploadedAt(LocalDateTime.now());

        entityManager.persist(image1);
        entityManager.persist(image2);
        entityManager.persist(image3);
        entityManager.flush();
    }

    @Test
    @DisplayName("Should find all images by contract number")
    void testFindByContractNum() {
        List<ContractImage> images = contractImageRepository.findByContractNum("CTR-2025-001");

        assertThat(images).hasSize(2)
                .extracting(ContractImage::getFileName)
                .containsExactlyInAnyOrder("id_card_1.jpg", "contract_scan_1.pdf");
    }

    @Test
    @DisplayName("Should return empty list if contract number not found")
    void testFindByContractNumNotFound() {
        List<ContractImage> images = contractImageRepository.findByContractNum("CTR-2025-999");

        assertThat(images).isEmpty();
    }
}
