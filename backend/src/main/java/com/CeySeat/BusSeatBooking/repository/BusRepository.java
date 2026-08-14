package com.CeySeat.BusSeatBooking.repository;

import com.CeySeat.BusSeatBooking.model.Bus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BusRepository extends MongoRepository<Bus, String> {
    List<Bus> findByOperatorId(String operatorId);
}

