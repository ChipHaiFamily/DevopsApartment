package com.example.apartmentmanagement.service;

import com.example.apartmentmanagement.dto.RoomDto;
import com.example.apartmentmanagement.exception.ResourceNotFoundException;
import com.example.apartmentmanagement.model.*;
import com.example.apartmentmanagement.repository.ContractRepository;
import com.example.apartmentmanagement.repository.RoomRepository;
import com.example.apartmentmanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoomServiceTest {

    @Mock
    private RoomRepository roomRepo;
    @Mock
    private ContractRepository contractRepo;
    @Mock
    private UserRepository userRepo;

    @InjectMocks
    private RoomService roomService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findAll_returnsMappedRoomDtos() {
        Room room101 = Room.builder().roomNum("101").floor(1).status("available").build();
        Room room102 = Room.builder().roomNum("102").floor(1).status("occupied").build();

        when(roomRepo.findAll()).thenReturn(List.of(room101, room102));
        when(contractRepo.findByRoom_RoomNum(anyString())).thenReturn(List.of());

        List<RoomDto> list = roomService.findAll();
        assertEquals(2, list.size());
        assertEquals("101", list.get(0).getRoomNum());
        assertEquals("occupied", list.get(1).getStatus()); // uppercase ถูก map เป็น lowercase?
    }

    @Test
    void findById_existingRoom_returnsDto() {
        Room room = Room.builder().roomNum("105").floor(1).status("occupied").build();
        when(roomRepo.findById("105")).thenReturn(Optional.of(room));
        when(contractRepo.findByRoom_RoomNum("105")).thenReturn(List.of());

        RoomDto dto = roomService.findById("105");
        assertEquals("105", dto.getRoomNum());
        assertEquals("occupied", dto.getStatus());
    }

    @Test
    void create_savesAndReturnsDto() {
        RoomDto input = RoomDto.builder().roomNum("111").floor(2).status("available").build();
        Room saved = Room.builder().roomNum("111").floor(2).status("available").build();

        when(roomRepo.save(any(Room.class))).thenReturn(saved);
        when(contractRepo.findByRoom_RoomNum("111")).thenReturn(List.of());

        RoomDto dto = roomService.create(input);
        assertEquals("111", dto.getRoomNum());
        assertEquals("available", dto.getStatus());
    }

    @Test
    void update_existingRoom_updatesAndReturnsDto() {
        Room room = Room.builder().roomNum("112").floor(2).status("available").build();
        RoomDto dto = RoomDto.builder().floor(2).status("occupied").build();

        when(roomRepo.findById("112")).thenReturn(Optional.of(room));
        when(roomRepo.save(room)).thenReturn(room);
        when(contractRepo.findByRoom_RoomNum("112")).thenReturn(List.of());

        RoomDto updated = roomService.update("112", dto);
        assertEquals("occupied", updated.getStatus());
        assertEquals(2, updated.getFloor());
    }

    @Test
    void countRentedRooms_returnsCorrectCount() {
        Room r101 = Room.builder().status("occupied").build();
        Room r102 = Room.builder().status("available").build();
        Room r201 = Room.builder().status("occupied").build();

        when(roomRepo.findAll()).thenReturn(List.of(r101, r102, r201));

        assertEquals(2, roomService.countRentedRooms());
    }

    @Test
    void countRooms_returnsCorrectCount() {
        when(roomRepo.count()).thenReturn(3L);

        int result = roomService.countRooms();

        assertEquals(3, result);
        verify(roomRepo, times(1)).count();
    }

    @Test
    void getRoomStatuses_returnsDtos() {
        Room r101 = Room.builder().roomNum("101").floor(1).status("occupied").build();
        Room r201 = Room.builder().roomNum("201").floor(2).status("available").build();

        when(roomRepo.findAll()).thenReturn(List.of(r101, r201));
        when(contractRepo.findByRoom_RoomNum(anyString())).thenReturn(List.of());

        List<RoomDto> list = roomService.getRoomStatuses();
        assertEquals(2, list.size());
        assertEquals("101", list.get(0).getRoomNum());
        assertEquals("occupied", list.get(0).getStatus());
        assertEquals("201", list.get(1).getRoomNum());
        assertEquals("available", list.get(1).getStatus());
    }

    @Test
    void findAll_withActiveContract_returnsTenantName() {
        User user = User.builder().fullName("John Doe").build();
        Tenant tenant = Tenant.builder().user(user).build();
        Contract activeContract = Contract.builder().status("active").tenant(tenant).build();

        Room room = Room.builder().roomNum("301").floor(3).status("occupied").build();

        when(roomRepo.findAll()).thenReturn(List.of(room));
        when(contractRepo.findByRoom_RoomNum("301")).thenReturn(List.of(activeContract));

        List<RoomDto> list = roomService.findAll();
        assertEquals("John Doe", list.get(0).getTenantName());
    }

    @Test
    void findById_withRoomType_returnsRoomTypeInfo() {
        RoomType type = RoomType.builder().name("Deluxe").price(BigDecimal.valueOf(1000.0)).build();
        Room room = Room.builder().roomNum("202").floor(2).status("available").roomType(type).build();

        when(roomRepo.findById("202")).thenReturn(Optional.of(room));
        when(contractRepo.findByRoom_RoomNum("202")).thenReturn(List.of());

        RoomDto dto = roomService.findById("202");
        assertEquals("Deluxe", dto.getRoomTypeName());
        assertEquals(BigDecimal.valueOf(1000.0), dto.getPrice());
    }

    @Test
    void findById_notFound_throwsException() {
        when(roomRepo.findById("999")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> roomService.findById("999"));
    }

    @Test
    void findAll_withContractWithoutTenant_returnsNullTenantName() {
        Contract contractWithoutTenant = Contract.builder().status("active").tenant(null).build();
        Room room = Room.builder().roomNum("401").floor(4).status("occupied").build();

        when(roomRepo.findAll()).thenReturn(List.of(room));
        when(contractRepo.findByRoom_RoomNum("401")).thenReturn(List.of(contractWithoutTenant));

        List<RoomDto> list = roomService.findAll();
        assertNull(list.get(0).getTenantName());
    }

}
