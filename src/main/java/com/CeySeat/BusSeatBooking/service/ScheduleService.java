package com.CeySeat.BusSeatBooking.service;

import com.CeySeat.BusSeatBooking.model.Schedule;
import com.CeySeat.BusSeatBooking.repository.ScheduleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    public List<Schedule> getSchedulesByRouteAndTime(String routeId, LocalDateTime start, LocalDateTime end) {
        return scheduleRepository.findByRouteIdAndDepartureTimeBetween(routeId, start, end);
    }

    public Schedule addSchedule(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }
}
