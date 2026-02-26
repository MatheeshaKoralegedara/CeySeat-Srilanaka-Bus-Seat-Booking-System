package com.CeySeat.BusSeatBooking.repository;

import com.CeySeat.BusSeatBooking.model.Route;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RouteRepository extends MongoRepository<Route, String> {
}
