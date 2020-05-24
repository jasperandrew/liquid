SELECT states.user_state, COUNT (DISTINCT follows.user_id) as new_mau_count
FROM analytics_prod.friendship_audits follows 
JOIN analytics_raw.analytics_prod.user_states states ON states.user_id = follows.user_id
JOIN growth_staging.new_mau_daily mau ON follows.user_id=mau.user_id AND follows.created_date=mau.created_date
JOIN analytics_prod.combined_user_snapshot users ON follows.friend_id=users.id # CUS
WHERE LOWER(users.profile_screen_name) IN 
('simpleplan',
'lyzabethlopex')
AND mau.created_date>='2016-02-07' AND mau.created_date <='2016-02-21' 
AND states.date = '2016-03-01' 
AND event='FOLLOW' 
AND DATEDIFF(hour, mau.created_date, follows.created_date) <= 24 
AND DATEDIFF(hour, mau.created_date, follows.created_date) >= 0
GROUP BY states.user_state
ORDER BY states.user_state;
