package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.ContractImage;
import com.example.apartmentmanagement.service.ContractImageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ContractImageControllerTest {

    @Mock
    private ContractImageService service;

    @InjectMocks
    private ContractImageController controller;

    private MockMvc mockMvc;

    // Inline global exception handler สำหรับ test
    @RestControllerAdvice
    static class TestExceptionHandler {
        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<String> handleRuntime(RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
        }
    }

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new TestExceptionHandler())
                .build();
    }

    @Test
    void uploadContractImage_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "image.jpg", "image/jpeg", "data".getBytes());

        doNothing().when(service).uploadContractImage("C001", "SIGNATURE", file);

        mockMvc.perform(multipart("/api/contracts/images/C001/upload")
                        .file(file)
                        .param("imageType", "SIGNATURE"))
                .andExpect(status().isOk())
                .andExpect(content().string("Upload successful"));

        verify(service, times(1)).uploadContractImage("C001", "SIGNATURE", file);
    }

    @Test
    void getImagesByContract_ReturnsList() throws Exception {
        ContractImage img1 = new ContractImage();
        img1.setImageId(1L);
        ContractImage img2 = new ContractImage();
        img2.setImageId(2L);

        List<ContractImage> images = Arrays.asList(img1, img2);
        when(service.getImagesByContract("C001")).thenReturn(images);

        mockMvc.perform(get("/api/contracts/images/C001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].imageId").value(1))
                .andExpect(jsonPath("$[1].imageId").value(2));

        verify(service, times(1)).getImagesByContract("C001");
    }

    @Test
    void viewImage_SuccessAndMismatch() throws Exception {
        ContractImage image = new ContractImage();
        image.setImageId(1L);
        image.setContractNum("C001");
        image.setMimeType("image/jpeg");
        image.setImageData("data".getBytes());

        when(service.getImageById(1L)).thenReturn(image);

        // success
        mockMvc.perform(get("/api/contracts/images/C001/view/1"))
                .andExpect(status().isOk())
                .andExpect(content().bytes("data".getBytes()));

        // contract mismatch → exception
        mockMvc.perform(get("/api/contracts/images/C002/view/1"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Image does not belong to this contract"));

        verify(service, times(2)).getImageById(1L);
    }

    @Test
    void viewAllImages_ReturnsBytes() throws Exception {
        ContractImage img1 = new ContractImage();
        img1.setImageData("data1".getBytes());
        ContractImage img2 = new ContractImage();
        img2.setImageData("data2".getBytes());

        when(service.getImagesByContract("C001")).thenReturn(Arrays.asList(img1, img2));

        mockMvc.perform(get("/api/contracts/images/C001/view-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").isNotEmpty())
                .andExpect(jsonPath("$[1]").isNotEmpty());

        verify(service, times(1)).getImagesByContract("C001");
    }

    @Test
    void downloadImage_SuccessAndMismatch() throws Exception {
        ContractImage image = new ContractImage();
        image.setImageId(1L);
        image.setContractNum("C001");
        image.setMimeType("image/jpeg");
        image.setFileName("img.jpg");
        image.setImageData("data".getBytes());

        when(service.getImageById(1L)).thenReturn(image);

        // success
        mockMvc.perform(get("/api/contracts/images/C001/download/1"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"img.jpg\""))
                .andExpect(content().bytes("data".getBytes()));

        // contract mismatch → exception
        mockMvc.perform(get("/api/contracts/images/C002/download/1"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Image does not belong to this contract"));

        verify(service, times(2)).getImageById(1L);
    }

    @Test
    void updateContractImage_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "image.jpg", "image/jpeg", "data".getBytes());

        doNothing().when(service).updateContractImage("C001", 1L, "SIGNATURE", file);

        mockMvc.perform(multipart("/api/contracts/images/C001/update/1")
                        .file(file)
                        .param("imageType", "SIGNATURE")
                        .with(request -> { request.setMethod("PUT"); return request; }))
                .andExpect(status().isOk())
                .andExpect(content().string("Image updated successfully"));

        verify(service, times(1)).updateContractImage("C001", 1L, "SIGNATURE", file);
    }

    @Test
    void deleteContractImage_Success() throws Exception {
        doNothing().when(service).deleteContractImage("C001", 1L);

        mockMvc.perform(delete("/api/contracts/images/C001/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Image deleted successfully"));

        verify(service, times(1)).deleteContractImage("C001", 1L);
    }
}