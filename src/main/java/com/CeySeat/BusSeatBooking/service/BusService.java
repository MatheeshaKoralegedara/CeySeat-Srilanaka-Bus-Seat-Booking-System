package com.CeySeat.BusSeatBooking.service;

import com.CeySeat.BusSeatBooking.model.Bus;
import com.CeySeat.BusSeatBooking.repository.BusRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BusService {

    private final BusRepository busRepository;

    public BusService(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    public Bus addBus(Bus bus) {
        return busRepository.save(bus);
    }

    public Optional<Bus> getBusById(String id) {
        return busRepository.findById(id);
    }

    public void deleteBus(String id) {
        busRepository.deleteById(id);
    }
}
