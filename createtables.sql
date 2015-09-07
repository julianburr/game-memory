-- phpMyAdmin SQL Dump
-- version 3.5.8.1
-- http://www.phpmyadmin.net
--
-- Host: dd15512.kasserver.com
-- Generation Time: Jun 28, 2015 at 03:32 PM
-- Server version: 5.5.43-nmm1-log
-- PHP Version: 5.3.28-nmm3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Table structure for table `highscore`
--

CREATE TABLE IF NOT EXISTS `highscore` (
  `name` varchar(255) NOT NULL,
  `datetime` datetime NOT NULL,
  `email` varchar(255) NOT NULL,
  `score` decimal(5,1) NOT NULL,
  PRIMARY KEY (`name`,`datetime`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
