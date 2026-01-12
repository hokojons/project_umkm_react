-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 18, 2025 at 02:37 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dbumkm`
--

-- --------------------------------------------------------

--
-- Table structure for table `tacara`
--

CREATE TABLE `tacara` (
  `kodeacara` varchar(15) NOT NULL,
  `namaacara` varchar(50) NOT NULL,
  `detail` varchar(255) NOT NULL,
  `tanggal` date NOT NULL,
  `kuotapeserta` int(11) NOT NULL,
  `tanggaldaftar` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tadmin`
--

CREATE TABLE `tadmin` (
  `kodeadmin` varchar(5) NOT NULL,
  `namaadmin` varchar(15) NOT NULL,
  `katakunci` varchar(255) NOT NULL,
  `status` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tcart`
--

CREATE TABLE `tcart` (
  `kodepengguna` varchar(15) NOT NULL,
  `kodeproduk` varchar(15) NOT NULL,
  `jumlah` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tkategori`
--

CREATE TABLE `tkategori` (
  `kodekategori` varchar(5) NOT NULL,
  `namakategori` varchar(25) NOT NULL,
  `status` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tpengguna`
--

CREATE TABLE `tpengguna` (
  `kodepengguna` varchar(15) NOT NULL,
  `namapengguna` varchar(25) NOT NULL,
  `teleponpengguna` varchar(20) NOT NULL,
  `katakunci` varchar(255) NOT NULL,
  `status` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tpesertaacara`
--

CREATE TABLE `tpesertaacara` (
  `kodeacara` varchar(15) NOT NULL,
  `kodepengguna` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tproduk`
--

CREATE TABLE `tproduk` (
  `kodepengguna` varchar(15) NOT NULL,
  `kodeproduk` varchar(15) NOT NULL,
  `namaproduk` varchar(50) NOT NULL,
  `harga` double NOT NULL,
  `detail` varchar(255) NOT NULL,
  `status` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tumkm`
--

CREATE TABLE `tumkm` (
  `kodepengguna` varchar(15) NOT NULL,
  `namapemilik` varchar(25) NOT NULL,
  `namatoko` varchar(50) NOT NULL,
  `alamattoko` varchar(100) NOT NULL,
  `statuspengajuan` varchar(15) NOT NULL,
  `kodekategori` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tacara`
--
ALTER TABLE `tacara`
  ADD PRIMARY KEY (`kodeacara`);

--
-- Indexes for table `tadmin`
--
ALTER TABLE `tadmin`
  ADD PRIMARY KEY (`kodeadmin`);

--
-- Indexes for table `tcart`
--
ALTER TABLE `tcart`
  ADD PRIMARY KEY (`kodepengguna`,`kodeproduk`),
  ADD KEY `fk_kodeproduk_cart` (`kodeproduk`);

--
-- Indexes for table `tkategori`
--
ALTER TABLE `tkategori`
  ADD PRIMARY KEY (`kodekategori`);

--
-- Indexes for table `tpengguna`
--
ALTER TABLE `tpengguna`
  ADD PRIMARY KEY (`kodepengguna`),
  ADD UNIQUE KEY `namapengguna` (`namapengguna`),
  ADD UNIQUE KEY `teleponpengguna` (`teleponpengguna`);

--
-- Indexes for table `tpesertaacara`
--
ALTER TABLE `tpesertaacara`
  ADD PRIMARY KEY (`kodeacara`,`kodepengguna`),
  ADD KEY `fk_kodepengguna_pesertaacara` (`kodepengguna`);

--
-- Indexes for table `tproduk`
--
ALTER TABLE `tproduk`
  ADD PRIMARY KEY (`kodeproduk`),
  ADD KEY `fk_kodepengguna_produk` (`kodepengguna`);

--
-- Indexes for table `tumkm`
--
ALTER TABLE `tumkm`
  ADD PRIMARY KEY (`kodepengguna`),
  ADD KEY `fk_kodekategori_umkm` (`kodekategori`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tcart`
--
ALTER TABLE `tcart`
  ADD CONSTRAINT `fk_kodepengguna_cart` FOREIGN KEY (`kodepengguna`) REFERENCES `tpengguna` (`kodepengguna`) ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_kodeproduk_cart` FOREIGN KEY (`kodeproduk`) REFERENCES `tproduk` (`kodeproduk`) ON UPDATE NO ACTION;

--
-- Constraints for table `tpesertaacara`
--
ALTER TABLE `tpesertaacara`
  ADD CONSTRAINT `fk_kodeacara_pesertaacara` FOREIGN KEY (`kodeacara`) REFERENCES `tacara` (`kodeacara`) ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_kodepengguna_pesertaacara` FOREIGN KEY (`kodepengguna`) REFERENCES `tpengguna` (`kodepengguna`) ON UPDATE NO ACTION;

--
-- Constraints for table `tproduk`
--
ALTER TABLE `tproduk`
  ADD CONSTRAINT `fk_kodepengguna_produk` FOREIGN KEY (`kodepengguna`) REFERENCES `tpengguna` (`kodepengguna`) ON UPDATE NO ACTION;

--
-- Constraints for table `tumkm`
--
ALTER TABLE `tumkm`
  ADD CONSTRAINT `fk_kodekategori_umkm` FOREIGN KEY (`kodekategori`) REFERENCES `tkategori` (`kodekategori`) ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_kodepengguna_umkm` FOREIGN KEY (`kodepengguna`) REFERENCES `tpengguna` (`kodepengguna`) ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
