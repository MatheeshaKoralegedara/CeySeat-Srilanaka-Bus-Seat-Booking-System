package com.CeySeat.BusSeatBooking.controller;



import com.CeySeat.BusSeatBooking.model.Bus;
import com.CeySeat.BusSeatBooking.repository.BusRepository;
import org.springframework.web.bind.annotation.*;
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

    @PostMapping
    public Bus addBus(@RequestBody Bus bus) {
        return busRepository.save(bus);
    }
}
