// 📄 ContractImageService.java
package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.ContractImage;
import com.example.apartmentmanagement.repository.ContractImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractImageService {
    private final ContractImageRepository repository;

    public void uploadContractImage(String contractNum, String imageType, MultipartFile file) throws IOException {
        ContractImage image = ContractImage.builder()
                .contractNum(contractNum)
                .imageType(imageType)
                .imageData(file.getBytes())
                .fileName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .build();
        repository.save(image);
    }

    public List<ContractImage> getImagesByContract(String contractNum) {
        return repository.findByContractNum(contractNum);
    }

    public ContractImage getImageById(Long imageId) {
        return repository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));
    }

    public void updateContractImage(String contractNum, Long imageId, String imageType, MultipartFile file) throws IOException {
        ContractImage existing = getImageById(imageId);

        if (!existing.getContractNum().equals(contractNum)) {
            throw new RuntimeException("Image does not belong to this contract");
        }

        if (imageType != null && !imageType.isBlank()) {
            existing.setImageType(imageType);
        }

        if (file != null && !file.isEmpty()) {
            existing.setImageData(file.getBytes());
            existing.setFileName(file.getOriginalFilename());
            existing.setMimeType(file.getContentType());
        }

        repository.save(existing);
    }

    public void deleteContractImage(String contractNum, Long imageId) {
        ContractImage existing = getImageById(imageId);

        if (!existing.getContractNum().equals(contractNum)) {
            throw new RuntimeException("Image does not belong to this contract");
        }

        repository.delete(existing);
    }
}
