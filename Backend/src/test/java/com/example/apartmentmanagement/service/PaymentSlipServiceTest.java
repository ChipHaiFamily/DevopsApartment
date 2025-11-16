package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.PaymentSlip;
import com.example.apartmentmanagement.repository.PaymentSlipRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentSlipServiceTest {

    @Mock
    private PaymentSlipRepository repository;

    @InjectMocks
    private PaymentSlipService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testUploadSlip_NewSlip() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getBytes()).thenReturn(new byte[]{1,2,3});
        when(file.getOriginalFilename()).thenReturn("slip.jpg");
        when(file.getContentType()).thenReturn("image/jpeg");
        when(repository.findByPaymentId("P001")).thenReturn(List.of());

        service.uploadSlip("P001", file);

        ArgumentCaptor<PaymentSlip> captor = ArgumentCaptor.forClass(PaymentSlip.class);
        verify(repository).save(captor.capture());

        PaymentSlip saved = captor.getValue();
        assertEquals("P001", saved.getPaymentId());
        assertArrayEquals(new byte[]{1,2,3}, saved.getSlipData());
        assertEquals("slip.jpg", saved.getFileName());
        assertEquals("image/jpeg", saved.getMimeType());
    }

    @Test
    void testUploadSlip_ExistingSlip() throws IOException {
        PaymentSlip existing = new PaymentSlip();
        when(repository.findByPaymentId("P001")).thenReturn(List.of(existing));

        MultipartFile file = mock(MultipartFile.class);
        when(file.getBytes()).thenReturn(new byte[]{4,5,6});
        when(file.getOriginalFilename()).thenReturn("new.jpg");
        when(file.getContentType()).thenReturn("image/png");

        service.uploadSlip("P001", file);

        verify(repository).delete(existing);
        verify(repository).save(any(PaymentSlip.class));
    }

    @Test
    void testGetSlipByPayment_Found() {
        PaymentSlip slip = new PaymentSlip();
        when(repository.findByPaymentId("P001")).thenReturn(List.of(slip));

        PaymentSlip result = service.getSlipByPayment("P001");
        assertEquals(slip, result);
    }

    @Test
    void testGetSlipByPayment_NotFound() {
        when(repository.findByPaymentId("P001")).thenReturn(List.of());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.getSlipByPayment("P001"));
        assertTrue(ex.getMessage().contains("Slip not found"));
    }

    @Test
    void testUpdateSlip_Success() throws IOException {
        PaymentSlip existing = new PaymentSlip();
        when(repository.findByPaymentId("P001")).thenReturn(List.of(existing));
        when(repository.save(existing)).thenAnswer(invocation -> invocation.getArgument(0));

        MultipartFile file = mock(MultipartFile.class);
        when(file.getBytes()).thenReturn(new byte[]{7,8,9});
        when(file.getOriginalFilename()).thenReturn("updated.jpg");
        when(file.getContentType()).thenReturn("image/jpeg");

        PaymentSlip updated = service.updateSlip("P001", file);

        assertArrayEquals(new byte[]{7,8,9}, updated.getSlipData());
        assertEquals("updated.jpg", updated.getFileName());
        assertEquals("image/jpeg", updated.getMimeType());
    }

    @Test
    void testUpdateSlip_EmptyFile() {
        PaymentSlip existing = new PaymentSlip();
        when(repository.findByPaymentId("P001")).thenReturn(List.of(existing));

        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.updateSlip("P001", file));
        assertTrue(ex.getMessage().contains("must not be empty"));
    }

    @Test
    void testDeleteSlip_Success() {
        PaymentSlip slip = new PaymentSlip();
        when(repository.findByPaymentId("P001")).thenReturn(List.of(slip));

        service.deleteSlip("P001");

        verify(repository).delete(slip);
    }

    @Test
    void testDeleteSlip_NotFound() {
        when(repository.findByPaymentId("P001")).thenReturn(List.of());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.deleteSlip("P001"));
        assertTrue(ex.getMessage().contains("No slip found"));
    }
}
