package com.CeySeat.BusSeatBooking.service;

import com.CeySeat.BusSeatBooking.model.Route;
import com.CeySeat.BusSeatBooking.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RouteService {

    private final RouteRepository routeRepository;

    public RouteService(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    public Route createRoute(Route route) {
        return routeRepository.save(route);
    }

    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    public Optional<Route> getRouteById(String id) {
        return routeRepository.findById(id);
    }

    public void deleteRoute(String id) {
        routeRepository.deleteById(id);
    }
}
