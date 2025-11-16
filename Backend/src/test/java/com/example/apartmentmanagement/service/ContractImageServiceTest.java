package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.ContractImage;
import com.example.apartmentmanagement.repository.ContractImageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ContractImageServiceTest {

    @Mock
    private ContractImageRepository repository;

    @InjectMocks
    private ContractImageService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testUploadContractImage() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(file.getOriginalFilename()).thenReturn("test.jpg");
        when(file.getContentType()).thenReturn("image/jpeg");

        service.uploadContractImage("C001", "front", file);

        ArgumentCaptor<ContractImage> captor = ArgumentCaptor.forClass(ContractImage.class);
        verify(repository).save(captor.capture());

        ContractImage saved = captor.getValue();
        assertEquals("C001", saved.getContractNum());
        assertEquals("front", saved.getImageType());
        assertArrayEquals(new byte[]{1, 2, 3}, saved.getImageData());
        assertEquals("test.jpg", saved.getFileName());
        assertEquals("image/jpeg", saved.getMimeType());
    }

    @Test
    void testGetImagesByContract() {
        ContractImage img1 = new ContractImage();
        ContractImage img2 = new ContractImage();
        when(repository.findByContractNum("C001")).thenReturn(List.of(img1, img2));

        List<ContractImage> images = service.getImagesByContract("C001");
        assertEquals(2, images.size());
    }

    @Test
    void testGetImageByIdFound() {
        ContractImage img = new ContractImage();
        when(repository.findById(1L)).thenReturn(Optional.of(img));

        ContractImage result = service.getImageById(1L);
        assertEquals(img, result);
    }

    @Test
    void testGetImageByIdNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.getImageById(1L));
        assertTrue(ex.getMessage().contains("Image not found"));
    }

    @Test
    void testUpdateContractImageAllFields() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getBytes()).thenReturn(new byte[]{4, 5, 6});
        when(file.getOriginalFilename()).thenReturn("new.jpg");
        when(file.getContentType()).thenReturn("image/png");

        ContractImage existing = ContractImage.builder()
                .contractNum("C001")
                .imageType("front")
                .imageData(new byte[]{1, 2, 3})
                .fileName("old.jpg")
                .mimeType("image/jpeg")
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        service.updateContractImage("C001", 1L, "back", file);

        ArgumentCaptor<ContractImage> captor = ArgumentCaptor.forClass(ContractImage.class);
        verify(repository).save(captor.capture());

        ContractImage updated = captor.getValue();
        assertEquals("back", updated.getImageType());
        assertArrayEquals(new byte[]{4, 5, 6}, updated.getImageData());
        assertEquals("new.jpg", updated.getFileName());
        assertEquals("image/png", updated.getMimeType());
    }

    @Test
    void testUpdateContractImageWrongContract() {
        ContractImage existing = ContractImage.builder()
                .contractNum("C002")
                .build();
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.updateContractImage("C001", 1L, "back", null));
        assertTrue(ex.getMessage().contains("does not belong"));
    }

    @Test
    void testDeleteContractImageSuccess() {
        ContractImage existing = ContractImage.builder()
                .contractNum("C001")
                .build();
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        service.deleteContractImage("C001", 1L);

        verify(repository).delete(existing);
    }

    @Test
    void testDeleteContractImageWrongContract() {
        ContractImage existing = ContractImage.builder()
                .contractNum("C002")
                .build();
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.deleteContractImage("C001", 1L));
        assertTrue(ex.getMessage().contains("does not belong"));
    }
}