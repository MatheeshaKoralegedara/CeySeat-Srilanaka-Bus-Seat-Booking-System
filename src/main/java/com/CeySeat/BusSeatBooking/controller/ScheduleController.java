package com.CeySeat.BusSeatBooking.controller;

import com.CeySeat.BusSeatBooking.model.Schedule;
import com.CeySeat.BusSeatBooking.service.ScheduleService;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public List<Schedule> getSchedules(@RequestParam String routeId,
            @RequestParam String start,
            @RequestParam String end) {
        LocalDateTime startTime = LocalDateTime.parse(start);
        LocalDateTime endTime = LocalDateTime.parse(end);
        return scheduleService.getSchedulesByRouteAndTime(routeId, startTime, endTime);
    }

    @PostMapping
    public Schedule addSchedule(@RequestBody Schedule schedule) {
        return scheduleService.addSchedule(schedule);
    }

    @GetMapping("/{id}")
    public Schedule getSchedule(@PathVariable String id) {
        return scheduleService.getSchedule(id);
    }
}
