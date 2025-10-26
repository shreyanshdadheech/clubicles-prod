-- Update existing users to use new VIBGYOR professional roles
UPDATE users 
SET professionalRole = CASE 
  WHEN professionalRole = 'developer' THEN 'indigo'
  WHEN professionalRole = 'designer' THEN 'indigo'
  WHEN professionalRole = 'manager' THEN 'blue'
  WHEN professionalRole = 'consultant' THEN 'blue'
  WHEN professionalRole = 'freelancer' THEN 'yellow'
  WHEN professionalRole = 'entrepreneur' THEN 'yellow'
  WHEN professionalRole = 'student' THEN 'yellow'
  WHEN professionalRole = 'other' THEN 'grey'
  ELSE 'violet'
END
WHERE professionalRole IN ('developer', 'designer', 'manager', 'consultant', 'freelancer', 'entrepreneur', 'student', 'other');
