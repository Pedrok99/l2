-- horas semanais
select 
  cs.day_of_week,
  p.id as professor_id,
  SUM(TIME_TO_SEC(TIMEDIFF(cs.end_time, cs.start_time)) / 3600) as total_hours
from class_schedule cs
join class c on cs.class_id = c.id
join subject s on c.subject_id = s.id
join professor p on s.taught_by = p.id
group by cs.day_of_week, p.id
order by cs.day_of_week, p.id;

-- horários livres e ocupados 
select 
    r.id as room_id,
    r.name as room_name,
    case 
        when cs.id is null then 'Livre'
        else 'Ocupada'
    end as status
from room r
left join class_schedule cs 
    on cs.room_id = r.id
    and cs.day_of_week = 2      -- exemplo: 2 = terça-feira
    and '14:00:00' >= cs.start_time
    and '14:00:00' < cs.end_time
order by r.name;