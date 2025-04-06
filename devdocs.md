## Route Convention

List => module/list

Detail => module/detail/:id

Create => module/add

Update => module/update/:id

## Folder Structure

- src
  - components
    - global :: components that are used in multiple modules
    - custom :: custom ui components
    - ui :: shadcn components
- lib
  - helpers :: helper functions
- services :: api calls
  - endpoints :: api endpoints
  - instance :: axios instance for nest backend
  - JangoInstance :: axios instance for django backend
  - module.api.ts :: api functions calls for module
  - module.hooks.ts :: tanstack hooks for module
- store
  - index.ts :: zustandstore
  - useRoleBasedAccess.ts :: zustand store for role wise permission
- modules :: components for each pages

# Terminologies

Student :: is Shown as Learner in the application

Institute :: is Shown as School in the application

City :: is Shown as district in the application
State :: is Shown as provence in the application

RoleBasedAccess :: After adding secure route under component first go to dashboard route and add module name and action view after routeconfig file component id and after you access check module name this id and module name match after you will access.





# Full Project Flow

- Sigin as Super Admin
- Create Institute
- Create Admin for Institute
- The Email Id that was entered while creating the admin will receive an email with a link to set the password
- After setting the password, the admin can log in

## Setup Wizard
- Now Admin will create Year, Grades, Classes and Subjects for his school

## User Management
- Admin can create Teachers and assign them grade, class and subjects
- Admin can create Students and assign them grade, class, subjects and create their parents
- Teacher and Student will receive an email with a link to set the password


## Digital Marking
- Admin and Teacher can create Assessment and Subject Wise assessment for his school
- Admin and Teacher can upload the Answer sheets either student wise or bulk
- Admin and Teacher can start the grading process after that
- Once the grading is done, Admin and Teacher can see the result and they can Manually Review and Update the marks accordingly
- After that Admin, Teacher, Student and Parent can see thier results and Marked Answer sheets


## Personalized Learning
- Admin and Teacher can create see the streaghts and weakness of all students and can create quiz (Manually or Ai) for entire class 
- Student can view thier streaghts and weakness and can can generate Quiz with AI for themselves
- Student can take the quiz and see the result
- Admin and Teacher can see the result of the quiz for all Students
- Admin and Teacher can create lesson plan for entire class(like visit a museam for history class) 
- Admin and Teacher can add study material for entire class for all Years and Subjects(like books, past papers etc)
- Student can view the study material and lesson plan and can download the study material


## General Settings
- Admin can change the settings of the school like name, logo, address, phone number, Grade, Subjects etc
