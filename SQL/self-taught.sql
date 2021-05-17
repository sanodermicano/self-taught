-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 17, 2021 at 08:23 PM
-- Server version: 10.4.18-MariaDB
-- PHP Version: 8.0.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `self-taught`
--

-- --------------------------------------------------------

--
-- Table structure for table `skill`
--

DROP TABLE IF EXISTS `skill`;
CREATE TABLE `skill` (
  `name` varchar(255) NOT NULL,
  `level` int(3) NOT NULL,
  `position` int(3) NOT NULL,
  `ison` int(1) NOT NULL,
  `userid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Truncate table before insert `skill`
--

TRUNCATE TABLE `skill`;
--
-- Dumping data for table `skill`
--

INSERT INTO `skill` (`name`, `level`, `position`, `ison`, `userid`) VALUES
('Python', 3, 0, 1, 10),
('Kotlin', 1, 0, 1, 2),
('Physics', 1, 1, 1, 2),
('Java', 5, 0, 1, 1),
('C++ Unreal', 2, 1, 0, 1),
('android mobile', 3, 2, 0, 1),
('SolidWorks 2017', 3, 3, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Truncate table before insert `user`
--

TRUNCATE TABLE `user`;
--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `name`) VALUES
(1, 'pvmsano@gmail.com', '$2b$10$BnsosocX8LkoJMHYJL10AuLmJ2s/bX9G3HLFTWXS/NEMaf2dIZx7G', 'Sano'),
(2, 'potato@gmail.com', '$2b$10$xI3fC24oGZr5a5z1ly2cweKaLk.Ynb1Ye0diyQN1lM7xHV91FXpdC', 'Potato'),
(3, 'marki@gmail.com', '$2b$10$eMjUSRh300Jfxq/mCEm5VOBkmCkxUV5bFZOvE7EbQQh8Vw53BBhD.', 'mark'),
(4, 'markii@gmail.com', '$2b$10$PZ5Fql8TpbfZi3GoljfLdOPmMY8.MkUh6sRp0TynVkNJdJEgh1oYi', 'marks'),
(5, 'new@gmail.com', '$2b$10$gjQJpgBa9K3PGw.CspMI5eaQSaHB4GqZFg46JtuKCURv/68/apC12', 'new'),
(6, 'newg@gmail.com', '$2b$10$F9eGtSzwBTEkny2yS8dPkOxlXsKlY7RCIRSJTro2dtEHRiTGCJdYi', 'new'),
(7, 'asdasd@gmail.com', '$2b$10$PPqw5UsYHwt4KLJjw7hq0.Qi7PneA9qp4SxXlfodbgppCoKHs9faa', 'asdsad'),
(8, 'fasdfsad@gmail.com', '$2b$10$mr3YTA60NeQlB6NrNFf//OU.nUEqoCINe0gPp/IfgIoijJYEy.Wl6', 'fsadfad'),
(9, 'asdsads@gmail.com', '$2b$10$oBfocoyC8RzVh6PiLkCFWeWBXXcboqzG3OtkRsoYEG1nR5b/5QDx6', 'fsadfad'),
(10, 'likethis@gmail.com', '$2b$10$h6ep.OR0pVJlCcN0WpIj9O8lbu/sbItNsXglGSsiA7lmAHMeKxwDq', 'like this'),
(11, 'mais1010@yahoo.com', '$2b$10$hjdo0cYQlFBcewbgw6Zjw.QjEw7PK5tQlWzdD.Tbm.V7Zpjw3ccai', 'mais'),
(12, 'omarspla@gmail.com', '$2b$10$2tS/t52jz4zvBXNlmWAqk.qELno3fgiIIjlXt5rWI7B.e8v82vYSi', 'omar');

-- --------------------------------------------------------

--
-- Table structure for table `visited`
--

DROP TABLE IF EXISTS `visited`;
CREATE TABLE `visited` (
  `title` varchar(5000) NOT NULL,
  `description` mediumtext NOT NULL,
  `link` varchar(5000) NOT NULL,
  `rating` float NOT NULL,
  `date` datetime NOT NULL,
  `lrid` int(11) NOT NULL COMMENT 'Learning Resources ID',
  `userid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Truncate table before insert `visited`
--

TRUNCATE TABLE `visited`;
--
-- Dumping data for table `visited`
--

INSERT INTO `visited` (`title`, `description`, `link`, `rating`, `date`, `lrid`, `userid`) VALUES
('Dynamic JavaScript Master Class AJAX JSON Simple APIs | Udemy', 'Learn how to use AJAX to send data to your web server and get response data back to output in your web applciation', 'https://www.udemy.com/course/ajax-course/', 5, '2021-05-10 09:55:17', 15, 1),
('Mighty JavaScript (Advanced) | Udemy', 'Memory Management Absolute Relative Tolerance OOP What you dont know about Closures Boolean Short Circuiting', 'https://www.udemy.com/course/intermediate-to-advanced-javascript-developer/', 4.5, '2021-05-10 18:14:24', 32, 1),
('Advanced JavaScript Interview Questions: Ace the JS Interview | Udemy', 'In only seven hours you will learn enough javascript to transform from a Junior JS Dev into a Senior JS Guru', 'https://www.udemy.com/course/javascript-advanced/', 4, '2021-05-10 18:32:40', 11, 1),
('JavaScript and React for Developers: Master the Essentials | Udemy', 'Advance your JavaScript skills and learn the modern approach to web applications by building projects from the ground up', 'https://www.udemy.com/course/js-and-react-for-devs/', 2.5, '2021-05-10 19:00:09', 17, 1),
('Java Interview guide : 300+ Questions and Answers of Java | Udemy', '300 Java Interview Questions Crack Java Interviews Be Confident In Java Java Questions at one place', 'https://www.udemy.com/course/java-interview-guide-300-questions-and-answers/', 2.5, '2021-05-10 19:19:18', 295, 1),
('Advanced React and Redux Tutorial: 2019 Edition | Udemy', 'Walkthroughs on advanced React v1663 and Redux v400 Authentication Testing Middlewares HOCs and Deployment', 'https://www.udemy.com/course/react-redux-tutorial/', 2.5, '2021-05-10 19:37:01', 208, 1),
('Selenium Python with Behave BDD(Basic + Advance + Architect) | Udemy', 'Selenium Python with Behave BDD Page Objects Data Driven and many live projects Learn end to end framework concepts', 'https://www.udemy.com/course/selenium-python-tutorial/', 2.5, '2021-05-10 19:39:51', 5931, 1),
('Advanced React and Redux Tutorial: 2019 Edition | Udemy', 'Walkthroughs on advanced React v1663 and Redux v400 Authentication Testing Middlewares HOCs and Deployment', 'https://www.udemy.com/course/react-redux-tutorial/', 2.5, '2021-05-10 19:39:54', 208, 2),
('Blockchain A-Z™: Learn How To Build Your First Blockchain | Udemy', 'Harness the power of the most disruptive technology since the internet through real life examples Master Blockchain Now', 'https://www.udemy.com/course/build-your-blockchain-az/', 4, '2021-05-10 19:41:10', 5932, 2),
('How to post JSON to a server using C Stack Overflow', 'Heres the code Im using create a requestHttpWebRequest request HttpWebRequestWebRequestCreateurl requestKeepAlive falserequestProtocolVersion HttpVersionVersion10request', 'https://stackoverflow.com/questions/9145667/how-to-post-json-to-a-server-using-c?noredirect=1&lq=1', 3.5, '2021-05-12 15:29:51', 5933, 1),
('The complete Javascript ES6 course. | Udemy', 'Upgrade your javascript knowledge to 60', 'https://www.udemy.com/course/the-complete-javascript-es6-course/', 2.5, '2021-05-12 14:52:37', 31, 1),
('javascript How to remove part of a string Stack Overflow', 'Lets say I have test23 and I want to remove testHow do I do thatThe prefix before can change', 'https://stackoverflow.com/questions/3568921/how-to-remove-part-of-a-string', 2.5, '2021-05-12 17:34:57', 5946, 1),
('Java Quiz', '', 'https://www.w3schools.com/java/java_quiz.asp', 2.5, '2021-05-13 08:33:41', 5948, 1),
('Core Java Quiz | Java Online Test - javatpoint', 'Lets play core java online test or quiz that will help you to clear your concepts and will prepare you for the interviews', 'https://www.javatpoint.com/core-java-quiz', 2.5, '2021-05-13 08:37:36', 5949, 1),
('Java Quiz', '', 'https://www.w3schools.com/java/java_quiz.asp', 5, '2021-05-13 08:41:54', 5947, 1),
('SONGWRITING SIMPLIFIED: Music Theory, Melody & Creativity | Udemy', 'Songwriting for PIANO and GUITAR Chord Progressions Scales Melodies and Lyrics with no Music Reading', 'https://www.udemy.com/course/songwriting-simplified/', 2.5, '2021-05-13 09:36:03', 5951, 1),
('Songwriting & Music Production In GarageBand- A Total Guide! | Udemy', 'Learn how to use the powerful tools that GarageBand offers for creative songwriting and high quality music production', 'https://www.udemy.com/course/songwriting-music-production-in-garageband-a-total-guide/', 2.5, '2021-05-13 09:36:27', 5952, 1),
('Songwriting 101- Composition, Lyrics + Music Production | Udemy', 'Learn the Essentials of Songwriting Music Composition Lyrics Music Production in Different Genres Today', 'https://www.udemy.com/course/songwriting-and-music-composition-course/', 4, '2021-05-13 09:36:54', 5953, 1),
('Songwriting: Writing the Music | Coursera', 'Offered by Berklee College of Music If your notebook is full of unused lyrics and youre struggling to find inspiration for the music this Enroll for free', 'https://www.coursera.org/learn/songwriting-writing-the-music', 4.5, '2021-05-13 09:38:37', 5957, 1),
('Songwriting: Writing, Arranging, and Producing Music | Coursera', 'Offered by Berklee College of Music Write Arrange and Produce Your Original Songs Apply the tools and techniques of songwriting to bring Enroll for free', 'https://www.coursera.org/specializations/songwriting', 4.5, '2021-05-13 09:39:34', 5958, 1),
('The Basics Of Pro Songwriting | Udemy', 'Learn all the basics of writing commercial songs plus the EXACT method used by Pros', 'https://www.udemy.com/course/the-basics-of-pro-songwriting/', 4, '2021-05-13 19:17:18', 5950, 1),
('UNIX/Linux Operating system - Beginner to Advanced | Udemy', 'Complete UnixLinux OS learning with BASH', 'https://www.udemy.com/course/unix-linux-operating-system/', 2.5, '2021-05-16 06:23:10', 2947, 1),
('Romantic Scene From - Malayalam Movie - Pranayajeevitham [HD] - video Dailymotion', 'Pranayajeevitham is a Malayalam Full Movie 2014 Produced By ASNagarajanDirected By Srinivas Star Cast Meera JasminSrikanthComing SoonMalayalam Full Movie 2014 Thomson VillaMalayalam Full Movie 2014 NattarangMalayalam Full Movie 2014 On The WayThis Malayalam youtube movie channel Horizo Malayalam Moviescontains copyrightClassicEvergreenExclusiveOfficialMalayalamMalayalam Full Movie 2014Malayalam Full MovieMalayalam Hot Full Movie 2013Malayalam Hot Full Movie 1980Malayalam Film SongsMalayalam ComedyClick Here Subscribe NowhttpwwwyoutubecomsubscriptioncenteradduserHorizonmoviechannelClick Here 2013 Full MovieshttpswwwyoutubecomplaylistlistPLioibswPY7XAoAcRjghTiJBz8623VeuaQFollow us on TwitterwwwtwittercomMOVIEWORLDINDIALike Us on FacebookJoinhttpwwwfacebookcommovieworldmalayalamFollow us on Websitehttpwwwmovieworldindiacom', 'https://www.dailymotion.com/video/x3hdy65', 3, '2021-05-16 10:52:32', 5533, 1),
('Python Tutorial 2021 - YouTube', 'Get my Python Programming Bootcamp Series for 999 Expires May 15th httpbitlyDataScienceTut Highest Rated Python Udemy Course 48 Hrs 19', 'https://www.youtube.com/watch?v=H1elmMBnykA', 2.5, '2021-05-16 10:57:37', 5960, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `skill`
--
ALTER TABLE `skill`
  ADD KEY `skilluser` (`userid`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `visited`
--
ALTER TABLE `visited`
  ADD KEY `courseuser` (`userid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `skill`
--
ALTER TABLE `skill`
  ADD CONSTRAINT `skilluser` FOREIGN KEY (`userid`) REFERENCES `user` (`id`);

--
-- Constraints for table `visited`
--
ALTER TABLE `visited`
  ADD CONSTRAINT `courseuser` FOREIGN KEY (`userid`) REFERENCES `user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
