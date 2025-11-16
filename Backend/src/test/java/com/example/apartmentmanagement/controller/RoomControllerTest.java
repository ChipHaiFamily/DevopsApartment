package com.example.apartmentmanagement.controller;

import com.example.apartmentmanagement.dto.ApiResponse;
import com.example.apartmentmanagement.dto.RoomDto;
import com.example.apartmentmanagement.service.RoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoomControllerTest {

    @Mock
    private RoomService service;

    @InjectMocks
    private RoomController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAll_returnsRoomList() {
        RoomDto r1 = RoomDto.builder().roomNum("101").status("available").build();
        RoomDto r2 = RoomDto.builder().roomNum("102").status("occupied").build();

        when(service.findAll()).thenReturn(List.of(r1, r2));

        ResponseEntity<ApiResponse<List<RoomDto>>> response = controller.getAll();

        assertTrue(response.getBody().isSuccess());
        assertEquals(2, response.getBody().getData().size());
        verify(service).findAll();
    }

    @Test
    void getById_returnsRoom() {
        RoomDto r = RoomDto.builder().roomNum("101").status("available").build();
        when(service.findById("101")).thenReturn(r);

        ResponseEntity<ApiResponse<RoomDto>> response = controller.getById("101");

        assertTrue(response.getBody().isSuccess());
        assertEquals("101", response.getBody().getData().getRoomNum());
        verify(service).findById("101");
    }

    @Test
    void create_returnsCreatedRoom() {
        RoomDto input = RoomDto.builder().roomNum("103").status("available").build();
        RoomDto saved = RoomDto.builder().roomNum("103").status("available").build();
        when(service.create(input)).thenReturn(saved);

        ResponseEntity<ApiResponse<RoomDto>> response = controller.create(input);

        assertTrue(response.getBody().isSuccess());
        assertEquals("Room created", response.getBody().getMessage());
        assertEquals("103", response.getBody().getData().getRoomNum());
        verify(service).create(input);
    }

    @Test
    void update_returnsUpdatedRoom() {
        RoomDto input = RoomDto.builder().status("occupied").build();
        RoomDto updated = RoomDto.builder().roomNum("103").status("occupied").build();
        when(service.update("103", input)).thenReturn(updated);

        ResponseEntity<ApiResponse<RoomDto>> response = controller.update("103", input);

        assertTrue(response.getBody().isSuccess());
        assertEquals("Room updated", response.getBody().getMessage());
        assertEquals("occupied", response.getBody().getData().getStatus());
        verify(service).update("103", input);
    }

    @Test
    void delete_removesRoomSuccessfully() {
        String id = "103";
        doNothing().when(service).deleteById(id);

        ResponseEntity<ApiResponse<Void>> response = controller.delete(id);

        assertTrue(response.getBody().isSuccess());
        assertEquals("Room deleted", response.getBody().getMessage());
        assertNull(response.getBody().getData());

        verify(service).deleteById(id);
    }

}
