package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.model.RoomType;
import com.example.apartmentmanagement.repository.RoomTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoomTypeServiceTest {

    @Mock
    private RoomTypeRepository repository;

    @InjectMocks
    private RoomTypeService roomTypeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findAll_returnsAllRoomTypes() {
        RoomType rt1 = new RoomType();
        rt1.setName("Single");
        RoomType rt2 = new RoomType();
        rt2.setName("Double");

        when(repository.findAll()).thenReturn(List.of(rt1, rt2));

        List<RoomType> list = roomTypeService.findAll();
        assertEquals(2, list.size());
        assertEquals("Single", list.get(0).getName());
    }

    @Test
    void findById_existingId_returnsRoomType() {
        RoomType rt = new RoomType();
        rt.setName("Suite");

        when(repository.findById("RT01")).thenReturn(Optional.of(rt));

        Optional<RoomType> result = roomTypeService.findById("RT01");
        assertTrue(result.isPresent());
        assertEquals("Suite", result.get().getName());
    }

    @Test
    void save_savesAndReturnsRoomType() {
        RoomType rt = new RoomType();
        rt.setName("Deluxe");

        when(repository.save(rt)).thenReturn(rt);

        RoomType result = roomTypeService.save(rt);
        assertEquals("Deluxe", result.getName());
    }

    @Test
    void deleteById_callsRepositoryDelete() {
        roomTypeService.deleteById("RT02");
        verify(repository, times(1)).deleteById("RT02");
    }

    @Test
    void save_generatesId_whenIdIsNull_andNoExistingRoomType() {
        RoomType rt = new RoomType();
        rt.setName("Standard");

        when(repository.findTopByOrderByRoomTypeIdDesc()).thenReturn(Optional.empty());
        when(repository.save(any(RoomType.class))).thenAnswer(i -> i.getArgument(0));

        RoomType result = roomTypeService.save(rt);

        assertEquals("RT01", result.getRoomTypeId());
        assertEquals("Standard", result.getName());
    }

    @Test
    void save_generatesId_whenIdIsNull_andLastIdValid() {
        RoomType rt = new RoomType();
        rt.setName("Executive");

        RoomType last = new RoomType();
        last.setRoomTypeId("RT05");

        when(repository.findTopByOrderByRoomTypeIdDesc()).thenReturn(Optional.of(last));
        when(repository.save(any(RoomType.class))).thenAnswer(i -> i.getArgument(0));

        RoomType result = roomTypeService.save(rt);

        assertEquals("RT06", result.getRoomTypeId());
        assertEquals("Executive", result.getName());
    }

    @Test
    void save_generatesId_whenIdIsNull_andLastIdInvalidFormat() {
        RoomType rt = new RoomType();
        rt.setName("Penthouse");

        RoomType last = new RoomType();
        last.setRoomTypeId("INVALID");

        when(repository.findTopByOrderByRoomTypeIdDesc()).thenReturn(Optional.of(last));
        when(repository.save(any(RoomType.class))).thenAnswer(i -> i.getArgument(0));

        RoomType result = roomTypeService.save(rt);

        assertEquals("RT01", result.getRoomTypeId());
        assertEquals("Penthouse", result.getName());
    }

    @Test
    void save_usesExistingId_whenIdIsNotNull() {
        RoomType rt = new RoomType();
        rt.setRoomTypeId("RT10");
        rt.setName("Premium");

        when(repository.save(rt)).thenReturn(rt);

        RoomType result = roomTypeService.save(rt);

        assertEquals("RT10", result.getRoomTypeId());
        assertEquals("Premium", result.getName());
    }

}