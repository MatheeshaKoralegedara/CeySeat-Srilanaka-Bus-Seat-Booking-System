package com.CeySeat.BusSeatBooking.controller;

import com.CeySeat.BusSeatBooking.exception.NotFoundException;
import com.CeySeat.BusSeatBooking.model.Bus;
import com.CeySeat.BusSeatBooking.repository.BusRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/buses")
public class BusController {

    private final BusRepository busRepository;

    public BusController(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @GetMapping
    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    @GetMapping("/my")
    public ResponseEntity<List<Bus>> getMyBuses(Principal principal) {
        return ResponseEntity.ok(busRepository.findByOperatorId(principal.getName()));
    }

    @PostMapping
    public Bus addBus(@Valid @RequestBody Bus bus, Principal principal) {
        bus.setId(null);
        bus.setOperatorId(principal.getName());
        return busRepository.save(bus);
    }

    @GetMapping("/{id}")
    public Bus getBus(@PathVariable String id) {
        return busRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Bus not found: " + id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bus> updateBus(@PathVariable String id, @Valid @RequestBody Bus updated, Authentication authentication) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Bus not found: " + id));

        if (!bus.getOperatorId().equals(authentication.getName()) && !isAdmin(authentication)) {
            throw new SecurityException("You can only edit your own buses.");
        }

        bus.setRegistrationNo(updated.getRegistrationNo());
        bus.setModel(updated.getModel());
        bus.setTotalSeats(updated.getTotalSeats());
        bus.setLayoutType(updated.getLayoutType());
        bus.setTravelName(updated.getTravelName());
        bus.setBusType(updated.getBusType());
        bus.setContactNumber(updated.getContactNumber());
        if (updated.getSeatLayout() != null) {
            bus.setSeatLayout(updated.getSeatLayout());
        }

        return ResponseEntity.ok(busRepository.save(bus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBus(@PathVariable String id, Authentication authentication) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Bus not found: " + id));

        if (!bus.getOperatorId().equals(authentication.getName()) && !isAdmin(authentication)) {
            throw new SecurityException("You can only delete your own buses.");
        }

        busRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
