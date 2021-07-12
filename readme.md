# Quarantine Supervisor

## Description

* Due to the COVID-19 crisis, people who are travelling interstate or inter-district need to be home quarantined for 14 days.
* Therefore, to continuously check their health status, we have proposed a web based system which is monitoring their health status for every 4 hours.
* In this web based system a person who wants to go for 14 days home isolation can register by giving some basic details.
* After registering these people  are required to enter their health status for every 4-5 hours on the website.The entered data is later given for the doctor to review.
* Also these people using this website can send SOS notifications to district authorities in case of any medical emergency.
* Similarly the doctors appointed by the district authority will be assigned with patients who are in home isolation automatically by the system.
* These doctors will be notified once the patient enters his/her health status data on the website.
* By seeing these health data doctors will write reviews and advice.These reviews and advice can be seen by the patient in the same website later.
* Once the quarantine period of a patient is completed the doctor can discharge him/her. If a doctor sees any inconsistency in the health status of the patient he/she can extend the quarantine period for 7 more days.
* District authorities can view the list of all the patients who are in home quarantine in their district.They can also see the list of doctors appointed for monitoring the health status of patients and also they can hire new doctors.
* And district authority can view all SOS notifications sent by the patients and can take necessary action.



## Hardware and Software Requirements:
   
* Can work in any OS

* 4GB RAM

## Technologies used
* Front End
    * HTML
    * CSS
    * Bootstrap
    * Javascript
    * Jquery 
* Back End 
    * Nodejs
    * Expressjs
* Database
    * MongoDB

## Process Flow:
    
* ### Patient's End
  ![](/public/img/Parient_Flow_Chart.svg)

* ### Doctor's End
  ![](/public/img/Doctor_Flow_Chart.svg)

* ### District's admin End
  ![](/public/img/District_Flow_Chart.svg)

## Data Flow Diagram:
   ![](/public/img/DFD.png)