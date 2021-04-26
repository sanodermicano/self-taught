-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 01, 2021 at 09:29 AM
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
CREATE DATABASE IF NOT EXISTS `self-taught` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `self-taught`;

-- --------------------------------------------------------

--
-- Table structure for table `skill`
--

CREATE TABLE `skill` (
  `name` varchar(255) NOT NULL,
  `level` int(3) NOT NULL,
  `position` int(3) NOT NULL,
  `userid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `skill`
--

INSERT INTO `skill` (`name`, `level`, `position`, `userid`) VALUES
('C#', 3, 1, 1),
('Adobe', 5, 0, 1),
('Linux', 1, 0, 1),
('Character Animation', 3, 0, 1),
('Node', 5, 0, 1),
('Engineers Designers', 2, 1, 1),
('Photoshop', 2, 0, 2);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
(10, 'likethis@gmail.com', '$2b$10$h6ep.OR0pVJlCcN0WpIj9O8lbu/sbItNsXglGSsiA7lmAHMeKxwDq', 'like this');

-- --------------------------------------------------------

--
-- Table structure for table `visited`
--

CREATE TABLE `visited` (
  `id` int(11) NOT NULL,
  `title` varchar(5000) NOT NULL,
  `description` mediumtext NOT NULL,
  `link` varchar(5000) NOT NULL,
  `rating` int(1) NOT NULL,
  `date` date NOT NULL,
  `userid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `courseuser` (`userid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `visited`
--
ALTER TABLE `visited`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
