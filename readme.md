# Quarantine Supervisor

## Description

* Due to the COVID-19 crisis, people who are travelling interstate or inter-district need to be home quarantined for 14 days. Also the people who test positive with mild symptons needs quarantined in home
* Therefore, to continuously check their health status, we have proposed a web based system which is monitoring their health status for every 4 hours.
* In this web based system a person who are eligible for  home isolation can register by giving some required details.
* After registering,patients  are required to enter their health status for every 4-5 hours on the website.The entered data will sent to respective doctor  for review.
* In case of medical emergency, the patient can send a SOS request to the district administration.
* Similarly the doctors appointed by the district authority will be assigned with patients who are in home isolation automatically by the system.
* These doctors will be notified once the patient enters his/her health status data on the website.
* By seeing these health data doctors will write reviews and advice.These reviews and advice can be seen by the patient in the same website later.
* Once the quarantine period of a patient is completed the doctor can discharge him/her. If a doctor finds that the patinet needs more time for recovery then  he/she can extend the quarantine period for 7 more days.
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
  ![](/public/img/Patient_Flow_Chart.svg)

* ### Doctor's End
  ![](/public/img/Doctor_Flow_Chart.svg)

* ### District's admin End
  ![](/public/img/District_Flow_Chart.svg)

## Data Flow Diagram:
   ![](/public/img/DFD.png)
