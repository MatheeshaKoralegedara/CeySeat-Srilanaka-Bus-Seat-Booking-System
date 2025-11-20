package com.CeySeat.BusSeatBooking.repository;

import com.CeySeat.BusSeatBooking.model.Bus;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BusRepository extends MongoRepository<Bus, String> {
}

