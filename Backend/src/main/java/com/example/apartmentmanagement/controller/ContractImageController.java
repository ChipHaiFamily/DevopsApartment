// 📄 ContractImageController.java
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

    @GetMapping("/download/{imageId}")
    public ResponseEntity<byte[]> downloadImage(@PathVariable Long imageId) {
        ContractImage image = service.getImagesByContract(imageId.toString()).get(0);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + image.getFileName() + "\"")
                .body(image.getImageData());
    }
}
