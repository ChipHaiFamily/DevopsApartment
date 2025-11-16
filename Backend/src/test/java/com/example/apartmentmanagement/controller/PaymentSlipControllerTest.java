package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.PaymentSlip;
import com.example.apartmentmanagement.service.PaymentSlipService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentSlipControllerTest {

    @Mock
    private PaymentSlipService service;

    @InjectMocks
    private PaymentSlipController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void uploadSlip_returnsSuccessMessage() throws IOException {
        MockMultipartFile file =
                new MockMultipartFile("file", "slip.jpg", "image/jpeg", "imgdata".getBytes());

        doNothing().when(service).uploadSlip("P1", file);

        ResponseEntity<String> response = controller.uploadSlip("P1", file);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Slip uploaded successfully", response.getBody());
        verify(service).uploadSlip("P1", file);
    }

    @Test
    void viewSlip_returnsByteData() {
        byte[] data = "hello".getBytes();

        PaymentSlip slip = PaymentSlip.builder()
                .fileName("slip.jpg")
                .mimeType("image/jpeg")
                .slipData(data)
                .build();

        when(service.getSlipByPayment("P1")).thenReturn(slip);

        ResponseEntity<byte[]> response = controller.viewSlip("P1");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("image/jpeg", response.getHeaders().getContentType().toString());
        assertTrue(response.getHeaders().getFirst("Content-Disposition").contains("inline"));
        assertArrayEquals(data, response.getBody());

        verify(service).getSlipByPayment("P1");
    }

    @Test
    void downloadSlip_returnsAttachment() {
        byte[] data = "hello".getBytes();

        PaymentSlip slip = PaymentSlip.builder()
                .fileName("slip.jpg")
                .mimeType("image/jpeg")
                .slipData(data)
                .build();

        when(service.getSlipByPayment("P1")).thenReturn(slip);

        ResponseEntity<byte[]> response = controller.downloadSlip("P1");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("image/jpeg", response.getHeaders().getContentType().toString());
        assertTrue(response.getHeaders().getFirst("Content-Disposition").contains("attachment"));
        assertArrayEquals(data, response.getBody());

        verify(service).getSlipByPayment("P1");
    }

    @Test
    void updateSlip_returnsUpdatedSlip() throws IOException {
        MockMultipartFile file =
                new MockMultipartFile("file", "newslip.jpg", "image/jpeg", "hello".getBytes());

        PaymentSlip updated = PaymentSlip.builder()
                .fileName("newslip.jpg")
                .mimeType("image/jpeg")
                .slipData("hello".getBytes())
                .build();

        when(service.updateSlip("P1", file)).thenReturn(updated);

        ResponseEntity<PaymentSlip> response = controller.updateSlip("P1", file);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("newslip.jpg", response.getBody().getFileName());
        verify(service).updateSlip("P1", file);
    }

    @Test
    void deleteSlip_returnsSuccessMessage() {
        doNothing().when(service).deleteSlip("P1");

        ResponseEntity<String> response = controller.deleteSlip("P1");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Slip deleted successfully", response.getBody());
        verify(service).deleteSlip("P1");
    }
}
