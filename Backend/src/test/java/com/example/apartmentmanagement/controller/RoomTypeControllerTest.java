package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.model.RoomType;
import com.example.apartmentmanagement.service.RoomTypeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoomTypeControllerTest {

    @Mock
    private RoomTypeService service;

    @InjectMocks
    private RoomTypeController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAll_returnsRoomTypeList() {
        RoomType r1 = RoomType.builder().roomTypeId("RT1").name("Deluxe").build();
        RoomType r2 = RoomType.builder().roomTypeId("RT2").name("Standard").build();
        when(service.findAll()).thenReturn(List.of(r1, r2));

        List<RoomType> result = controller.getAll();

        assertEquals(2, result.size());
        verify(service).findAll();
    }

    @Test
    void getById_returnsOptionalRoomType() {
        RoomType r = RoomType.builder().roomTypeId("RT1").name("Deluxe").build();
        when(service.findById("RT1")).thenReturn(Optional.of(r));

        Optional<RoomType> result = controller.getById("RT1");

        assertTrue(result.isPresent());
        assertEquals("Deluxe", result.get().getName());
        verify(service).findById("RT1");
    }

    @Test
    void create_returnsSavedRoomType() {
        RoomType input = RoomType.builder().name("Suite").build();
        RoomType saved = RoomType.builder().roomTypeId("RT3").name("Suite").build();
        when(service.save(input)).thenReturn(saved);

        RoomType result = controller.create(input);

        assertEquals("Suite", result.getName());
        assertEquals("RT3", result.getRoomTypeId());
        verify(service).save(input);
    }

    @Test
    void update_setsIdAndSavesRoomType() {
        RoomType input = RoomType.builder().name("Premium").build();
        RoomType updated = RoomType.builder().roomTypeId("RT4").name("Premium").build();
        when(service.save(input)).thenReturn(updated);

        RoomType result = controller.update("RT4", input);

        assertEquals("RT4", result.getRoomTypeId());
        assertEquals("Premium", result.getName());
        verify(service).save(input);
    }

    @Test
    void delete_callsServiceDelete() {
        controller.delete("RT5");
        verify(service).deleteById("RT5");
    }
}
