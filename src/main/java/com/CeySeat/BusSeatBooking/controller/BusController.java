package com.CeySeat.BusSeatBooking.controller;

import com.CeySeat.BusSeatBooking.model.Bus;
import com.CeySeat.BusSeatBooking.repository.BusRepository;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    @GetMapping("/my")
    public ResponseEntity<List<Bus>> getMyBuses(Principal principal) {
        return ResponseEntity.ok(busRepository.findByOperatorId(principal.getName()));
    }

    @PostMapping
    public Bus addBus(@RequestBody Bus bus, Principal principal) {
        bus.setOperatorId(principal.getName());
        return busRepository.save(bus);
    }

    @GetMapping("/{id}")
    public Bus getBus(@PathVariable String id) {
        return busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found: " + id));
    }
}
