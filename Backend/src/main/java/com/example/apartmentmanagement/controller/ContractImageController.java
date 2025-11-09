package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.ContractImage;
import com.example.apartmentmanagement.service.ContractImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/contracts/images")
@RequiredArgsConstructor
public class ContractImageController {

    private final ContractImageService service;

    @PostMapping("/{contractNum}/upload")
    public ResponseEntity<String> uploadContractImage(
            @PathVariable String contractNum,
            @RequestParam String imageType,
            @RequestParam MultipartFile file) throws IOException {
        service.uploadContractImage(contractNum, imageType, file);
        return ResponseEntity.ok("Upload successful");
    }

    @GetMapping("/{contractNum}")
    public ResponseEntity<List<ContractImage>> getImagesByContract(@PathVariable String contractNum) {
        return ResponseEntity.ok(service.getImagesByContract(contractNum));
    }

    @GetMapping("/{contractNum}/view/{imageId}")
    public ResponseEntity<byte[]> viewImage(
            @PathVariable String contractNum,
            @PathVariable Long imageId) {
        ContractImage image = service.getImageById(imageId);
        if (!image.getContractNum().equals(contractNum)) {
            throw new RuntimeException("Image does not belong to this contract");
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getMimeType()))
                .body(image.getImageData());
    }

    @GetMapping("/{contractNum}/view-all")
    public ResponseEntity<List<byte[]>> viewAllImages(@PathVariable String contractNum) {
        List<ContractImage> images = service.getImagesByContract(contractNum);
        List<byte[]> imageBytes = images.stream()
                .map(ContractImage::getImageData)
                .toList();
        return ResponseEntity.ok(imageBytes);
    }

    @GetMapping("/{contractNum}/download/{imageId}")
    public ResponseEntity<byte[]> downloadImage(
            @PathVariable String contractNum,
            @PathVariable Long imageId) {
        ContractImage image = service.getImageById(imageId);
        if (!image.getContractNum().equals(contractNum)) {
            throw new RuntimeException("Image does not belong to this contract");
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + image.getFileName() + "\"")
                .body(image.getImageData());
    }

    @PutMapping("/{contractNum}/update/{imageId}")
    public ResponseEntity<String> updateContractImage(
            @PathVariable String contractNum,
            @PathVariable Long imageId,
            @RequestParam(required = false) String imageType,
            @RequestParam(required = false) MultipartFile file) throws IOException {
        service.updateContractImage(contractNum, imageId, imageType, file);
        return ResponseEntity.ok("Image updated successfully");
    }

    @DeleteMapping("/{contractNum}/delete/{imageId}")
    public ResponseEntity<String> deleteContractImage(
            @PathVariable String contractNum,
            @PathVariable Long imageId) {
        service.deleteContractImage(contractNum, imageId);
        return ResponseEntity.ok("Image deleted successfully");
    }
}
