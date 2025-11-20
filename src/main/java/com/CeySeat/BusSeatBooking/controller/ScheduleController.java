package com.CeySeat.BusSeatBooking.controller;


import com.CeySeat.BusSeatBooking.model.Schedule;
import com.CeySeat.BusSeatBooking.repository.ScheduleRepository;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleRepository scheduleRepository;

    public ScheduleController(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    @GetMapping
    public List<Schedule> getSchedules(@RequestParam String routeId,
                                       @RequestParam String start,
                                       @RequestParam String end) {
        LocalDateTime startTime = LocalDateTime.parse(start);
        LocalDateTime endTime = LocalDateTime.parse(end);
        return scheduleRepository.findByRouteIdAndDepartureTimeBetween(routeId, startTime, endTime);
    }

    @PostMapping
    public Schedule addSchedule(@RequestBody Schedule schedule) {
        return scheduleRepository.save(schedule);
    }
}
