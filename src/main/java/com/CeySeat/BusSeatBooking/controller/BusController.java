package com.CeySeat.BusSeatBooking.controller;

import com.CeySeat.BusSeatBooking.model.Bus;
import com.CeySeat.BusSeatBooking.service.BusService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/buses")
public class BusController {

    private final BusService busService;

    public BusController(BusService busService) {
        this.busService = busService;
    }

    @GetMapping
    public List<Bus> getAllBuses() {
        return busService.getAllBuses();
    }

    @PostMapping
    public Bus addBus(@RequestBody Bus bus) {
        return busService.addBus(bus);
    }

    @GetMapping("/{id}")
    public Bus getBus(@PathVariable String id) {
        return busService.getBusById(id)
                .orElseThrow(() -> new com.CeySeat.BusSeatBooking.exception.ResourceNotFoundException("Bus not found"));
    }
}
