-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 30, 2025 at 01:32 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `learning_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `text` text NOT NULL,
  `user_id` int(11) NOT NULL,
  `video_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `text`, `user_id`, `video_id`, `parent_id`, `created_at`, `updated_at`) VALUES
(30, 'f', 4, 8, NULL, '2025-06-26 23:32:48', '2025-06-26 23:32:48'),
(31, 'o', 4, 11, NULL, '2025-06-26 23:33:04', '2025-06-26 23:52:36'),
(32, 'a', 4, 9, NULL, '2025-06-26 23:35:32', '2025-06-26 23:35:32'),
(33, 'c', 4, 11, NULL, '2025-06-26 23:40:49', '2025-06-26 23:40:49'),
(34, 'd', 4, 11, 33, '2025-06-27 00:06:41', '2025-06-27 00:06:41'),
(35, 'd', 4, 11, 33, '2025-06-27 00:06:57', '2025-06-27 00:06:57'),
(36, 'd', 4, 11, 33, '2025-06-27 00:19:49', '2025-06-27 00:19:49'),
(40, 'f', 4, 11, NULL, '2025-06-27 00:22:59', '2025-06-27 00:22:59'),
(41, 'd', 4, 11, NULL, '2025-06-27 00:23:14', '2025-06-27 00:23:14'),
(43, 'ftj', 4, 11, NULL, '2025-06-27 00:25:00', '2025-06-27 00:25:00'),
(44, 'ddd', 4, 11, 41, '2025-06-27 00:25:55', '2025-06-27 00:25:55'),
(45, 'p', 4, 11, NULL, '2025-06-27 00:29:28', '2025-06-27 00:29:28'),
(48, 'f', 4, 11, NULL, '2025-06-27 00:32:33', '2025-06-27 00:32:33'),
(50, 'd', 4, 11, NULL, '2025-06-27 00:38:28', '2025-06-27 00:38:28'),
(51, 'd', 4, 11, NULL, '2025-06-27 00:38:33', '2025-06-27 00:38:33'),
(52, 'd', 4, 11, NULL, '2025-06-27 00:38:35', '2025-06-27 00:38:35'),
(53, 'd', 4, 11, NULL, '2025-06-27 00:38:43', '2025-06-27 00:38:43'),
(54, 'd', 4, 11, NULL, '2025-06-27 00:38:44', '2025-06-27 00:38:44'),
(55, 'd', 4, 11, NULL, '2025-06-27 00:40:05', '2025-06-27 00:40:05'),
(58, 'f', 4, 11, 43, '2025-06-27 00:41:56', '2025-06-27 00:41:56'),
(59, 'h', 4, 11, 40, '2025-06-27 00:42:18', '2025-06-27 00:42:18'),
(60, 'h', 4, 11, 55, '2025-06-27 00:42:28', '2025-06-27 00:42:28'),
(61, 'd', 4, 11, NULL, '2025-06-27 00:42:33', '2025-06-27 00:42:33'),
(63, 'h', 4, 11, 61, '2025-06-27 00:42:51', '2025-06-27 00:42:51'),
(64, 'fd', 4, 11, NULL, '2025-06-27 00:52:45', '2025-06-27 00:52:45'),
(66, 'd', 4, 11, NULL, '2025-06-27 00:53:19', '2025-06-27 00:53:19'),
(67, 'd', 4, 11, 64, '2025-06-27 00:53:24', '2025-06-27 00:53:24'),
(68, 's', 4, 11, 55, '2025-06-27 00:53:34', '2025-06-27 00:53:34'),
(69, 'd', 4, 11, NULL, '2025-06-27 01:03:50', '2025-06-27 01:03:50'),
(70, 'w', 4, 11, 61, '2025-06-27 01:04:00', '2025-06-27 01:04:00'),
(71, 'y', 4, 11, 61, '2025-06-27 01:13:46', '2025-06-27 01:13:46'),
(72, 'yfrt', 4, 11, NULL, '2025-06-27 01:13:48', '2025-06-27 01:13:48'),
(73, 'yh', 4, 9, NULL, '2025-06-27 01:14:40', '2025-06-27 01:14:40'),
(74, 'vf', 4, 11, NULL, '2025-06-27 01:20:01', '2025-06-27 01:20:01'),
(76, 'f', 4, 11, 72, '2025-06-27 01:20:19', '2025-06-27 01:20:19'),
(77, 'df', 4, 11, NULL, '2025-06-27 01:25:26', '2025-06-27 01:25:26'),
(78, 'f', 4, 11, NULL, '2025-06-27 01:27:40', '2025-06-27 01:27:40'),
(79, 'f', 4, 11, 74, '2025-06-27 01:27:42', '2025-06-27 01:27:42'),
(80, 'dfarfff', 4, 11, NULL, '2025-06-27 01:30:40', '2025-06-27 01:30:40'),
(81, 'cvcvvvcxcedvxv', 4, 11, NULL, '2025-06-27 01:33:54', '2025-06-27 01:33:54'),
(82, 'dvvvdvdv', 4, 11, NULL, '2025-06-27 01:44:56', '2025-06-27 01:44:56'),
(83, 'fh', 4, 11, 81, '2025-06-27 01:45:06', '2025-06-27 01:45:06'),
(84, 'this the comment', 4, 11, NULL, '2025-06-27 08:12:31', '2025-06-27 08:12:31'),
(85, 'this is my comment', 4, 11, NULL, '2025-06-28 20:48:14', '2025-06-28 20:48:14'),
(86, 'hello', 4, 11, NULL, '2025-06-30 09:05:11', '2025-06-30 09:05:11'),
(87, 'hello', 4, 13, NULL, '2025-06-30 09:05:28', '2025-06-30 09:05:28');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `thumbnail` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `is_published` tinyint(1) DEFAULT 0,
  `instructor_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `youtube_url` varchar(50) NOT NULL DEFAULT 'eh4M5Rviw04',
  `duration` varchar(50) NOT NULL DEFAULT '15'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `title`, `description`, `thumbnail`, `price`, `is_published`, `instructor_id`, `created_at`, `updated_at`, `youtube_url`, `duration`) VALUES
(2, 'test 2', 'dsdwsdsds', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800', 10000.00, 1, 2, '2025-06-24 06:56:00', '2025-06-26 18:35:54', 'eh4M5Rviw04', '15'),
(3, 'test 2', 'dsdwsdsds', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800', 10000.00, 1, 2, '2025-06-24 06:56:04', '2025-06-26 18:35:57', 'eh4M5Rviw04', '15'),
(4, 'test 2', 'dsdwsdsds', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800', 10000.00, 1, 2, '2025-06-24 06:57:04', '2025-06-26 18:36:00', 'eh4M5Rviw04', '15'),
(7, 'turisanga', 'sfsfs', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800', 10000.00, 1, 2, '2025-06-24 07:24:06', '2025-06-26 18:36:21', 'eh4M5Rviw04', '15'),
(8, 'Public Speaking Fundamentals', 'Master the basics of effective public speaking through engaging video lessons. Learn from real-world examples and practice with guided exercises.', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800', 99.99, 1, 2, '2025-06-26 16:12:53', '2025-06-27 09:29:29', 'eh4M5Rviw04', '15'),
(9, 'Advanced Presentation Skills', 'Take your presentation skills to the next level with advanced video techniques and real-world case studies.', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800', 149.99, 1, 3, '2025-06-26 16:12:53', '2025-06-26 18:35:40', 'eh4M5Rviw04', '15'),
(10, 'Confidence Building for Speakers', 'Build confidence and overcome speaking anxiety through practical video exercises and mindset training.', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800', 79.99, 1, 2, '2025-06-26 16:12:53', '2025-06-26 16:12:53', 'eh4M5Rviw04', '15'),
(11, 'EDITED Lesson | Small Talk &amp;amp; Conversational Vocabulary', 'Lesson | Small Talk &amp;amp; Conversational VocabularyLesson | Small Talk &amp;amp; Conversational VocabularyLesson | Small Talk &amp;amp; Conversational VocabularyLesson | Small Talk &amp;amp; Conversational VocabularyLesson | Small Talk &amp;amp; Conversational VocabularyLesson | Small Talk &amp;amp; Conversational VocabularyLesson | Small Talk &amp;amp; Conversational VocabularyLesson | Small Talk &amp;amp; Conversational Vocabulary', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800', 10000.00, 1, 2, '2025-06-26 19:48:20', '2025-06-27 09:29:47', 'eh4M5Rviw04', '15'),
(13, 'scd', 'xscs', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800', 12.00, 1, 8, '2025-06-27 09:41:49', '2025-06-27 09:42:31', 'pU2ZaP_lO5c', '15');

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `status` enum('ACTIVE','COMPLETED','SUSPENDED','CANCELLED') DEFAULT 'ACTIVE',
  `progress` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrolled_at`, `completed_at`, `status`, `progress`) VALUES
(6, 4, 7, '2025-06-25 13:13:25', '2025-06-25 14:19:36', 'ACTIVE', 100.00),
(13, 4, 10, '2025-06-26 18:39:08', NULL, 'ACTIVE', 0.00),
(14, 4, 2, '2025-06-26 18:42:23', NULL, 'ACTIVE', 0.00),
(15, 4, 11, '2025-06-28 20:47:05', NULL, 'ACTIVE', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `order_num` int(11) NOT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `course_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `youtube_url` varchar(30) NOT NULL DEFAULT 'eh4M5Rviw04'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `title`, `description`, `order_num`, `is_published`, `course_id`, `created_at`, `updated_at`, `youtube_url`) VALUES
(8, 'sdwsds', 'sads', 1, 4, 9, '2025-06-27 05:07:55', '2025-06-27 05:07:55', 'eh4M5Rviw04');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('COURSE_UPDATE','TASK_DUE','TASK_GRADED','NEW_COMMENT','ENROLLMENT','GENERAL') NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `instructions` text DEFAULT NULL,
  `due_date` datetime NOT NULL,
  `points` int(11) DEFAULT 0,
  `task_type` enum('TEXT','FILE','BOTH') DEFAULT 'TEXT',
  `status` enum('ACTIVE','INACTIVE','ARCHIVED') DEFAULT 'ACTIVE',
  `course_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `instructions`, `due_date`, `points`, `task_type`, `status`, `course_id`, `created_at`, `updated_at`) VALUES
(6, 'fsfcxc', 'cvddfvv', 'fsfcsd', '2025-06-27 02:00:00', 1, 'TEXT', 'ACTIVE', 9, '2025-06-27 07:51:04', '2025-06-27 07:51:04'),
(7, 'sdc', 'sfcd', 'dsd', '2025-06-28 02:00:00', 3, 'TEXT', 'ACTIVE', 8, '2025-06-27 07:51:35', '2025-06-27 07:51:35'),
(8, 'next update', 'sfcd', 'dsd', '2025-06-28 02:00:00', 3, 'TEXT', 'ACTIVE', 8, '2025-06-27 07:51:51', '2025-06-27 07:55:23'),
(9, 'sdc', 'sfcd', 'dsd', '2025-06-28 02:00:00', 3, 'TEXT', 'INACTIVE', 8, '2025-06-27 07:52:42', '2025-06-27 07:54:48'),
(11, 'Lesson | Small Talk &amp;amp; Conversational Vocabulary', 'sdsdsxc', 'sdc dccd', '2025-06-28 02:00:00', 1, 'TEXT', 'ACTIVE', 11, '2025-06-27 07:56:23', '2025-06-27 07:56:23'),
(12, 'thias is new task', 'description', 'instyuc', '2025-06-30 02:00:00', 100, 'TEXT', 'ACTIVE', 8, '2025-06-28 20:59:21', '2025-06-28 20:59:21');

-- --------------------------------------------------------

--
-- Table structure for table `task_submissions`
--

CREATE TABLE `task_submissions` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `text_submission` text DEFAULT NULL,
  `file_urls` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `status` enum('PENDING','SUBMITTED','GRADED','RETURNED') DEFAULT 'PENDING',
  `grade` decimal(5,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `graded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `task_submissions`
--

INSERT INTO `task_submissions` (`id`, `task_id`, `student_id`, `text_submission`, `file_urls`, `comment`, `status`, `grade`, `feedback`, `submitted_at`, `graded_at`) VALUES
(14, 7, 4, 'dfsgvf', 'assignment_685e504d3cc333.26006441.pdf', NULL, 'GRADED', 80.00, 'keep up', '2025-06-27 08:03:25', '2025-06-27 13:00:36'),
(15, 6, 4, 'sdwcds', 'assignment_685e50a58fcdf3.95440834.pdf', NULL, 'PENDING', NULL, NULL, '2025-06-27 08:04:53', NULL),
(16, 11, 4, 'efergvdgerfv', 'assignment_685e513c9b3522.14232375.pdf', NULL, 'GRADED', 60.00, 'this is goodd', '2025-06-27 08:07:24', '2025-06-30 08:35:12'),
(17, 11, 4, 'sdsdf', 'assignment_686055605a5868.55677972.pdf', NULL, 'GRADED', 100.00, 'adaa', '2025-06-28 20:49:36', '2025-06-28 21:36:21');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('STUDENT','INSTRUCTOR','ADMIN') DEFAULT 'STUDENT',
  `avatar` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatar`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin@example.com', '$2y$10$SyZAPPwVV.qrNUyDB6iI8eeFlKK4D0hsO6oaBO6CzGFe9zgDss27K', 'ADMIN', NULL, 1, '2025-06-23 23:55:00', '2025-06-24 12:44:44'),
(2, 'John Instructor', 'instructor@example.com', '$2y$10$2qdDoxEnLhmkECMiYwEVXudmwoP6asghwEroFDfod2NlfwctUaiFq', 'INSTRUCTOR', NULL, 1, '2025-06-23 23:55:00', '2025-06-30 11:31:28'),
(3, 'Jane Student', 'student@example.com', '$2y$10$SyZAPPwVV.qrNUyDB6iI8eeFlKK4D0hsO6oaBO6CzGFe9zgDss27K', 'STUDENT', NULL, 1, '2025-06-23 23:55:00', '2025-06-24 12:44:54'),
(4, 'Jean Claude', 'developerstraining22@gmail.com', '$2y$10$2qdDoxEnLhmkECMiYwEVXudmwoP6asghwEroFDfod2NlfwctUaiFq', 'STUDENT', NULL, 1, '2025-06-24 00:13:48', '2025-06-24 13:00:41'),
(6, 'Jean Claude', 'de@gmail.com', '$2y$10$2qdDoxEnLhmkECMiYwEVXudmwoP6asghwEroFDfod2NlfwctUaiFq', 'ADMIN', NULL, 1, '2025-06-24 11:42:13', '2025-06-24 12:58:05'),
(8, 'Michael Chen', 'michael@ycspout.rw', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'INSTRUCTOR', NULL, 1, '2025-06-26 16:12:53', '2025-06-26 16:12:53'),
(9, 'Demo Student', 'demo@student.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STUDENT', NULL, 1, '2025-06-26 16:12:53', '2025-06-26 16:12:53');

-- --------------------------------------------------------

--
-- Table structure for table `videos`
--

CREATE TABLE `videos` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `video_url` varchar(500) NOT NULL,
  `duration` varchar(20) DEFAULT NULL,
  `order_num` int(11) NOT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `module_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `youtube_url` varchar(255) DEFAULT 'eh4M5Rviw04'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `videos`
--

INSERT INTO `videos` (`id`, `title`, `description`, `video_url`, `duration`, `order_num`, `is_published`, `module_id`, `created_at`, `updated_at`, `youtube_url`) VALUES
(33, 'dsdscs', 'dsddcsdwd', 'eg-3gCEbzsw', '15:20', 1, 2, 8, '2025-06-27 05:09:45', '2025-06-27 05:09:45', 'eh4M5Rviw04');

-- --------------------------------------------------------

--
-- Table structure for table `video_progress`
--

CREATE TABLE `video_progress` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `video_id` int(11) NOT NULL,
  `watched_seconds` decimal(10,2) DEFAULT 0.00,
  `is_completed` tinyint(1) DEFAULT 0,
  `last_watched_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `video_progress`
--

INSERT INTO `video_progress` (`id`, `user_id`, `video_id`, `watched_seconds`, `is_completed`, `last_watched_at`) VALUES
(2, 4, 10, 1.00, 1, '2025-06-26 19:19:37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_video` (`video_id`),
  ADD KEY `idx_parent` (`parent_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_instructor` (`instructor_id`),
  ADD KEY `idx_published` (`is_published`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_enrollment` (`student_id`,`course_id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_course` (`course_id`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_course` (`course_id`),
  ADD KEY `idx_order` (`order_num`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_read` (`is_read`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_module` (`course_id`),
  ADD KEY `idx_due_date` (`due_date`);

--
-- Indexes for table `task_submissions`
--
ALTER TABLE `task_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_task` (`task_id`),
  ADD KEY `idx_student` (`student_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_module` (`module_id`),
  ADD KEY `idx_order` (`order_num`);

--
-- Indexes for table `video_progress`
--
ALTER TABLE `video_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_progress` (`user_id`,`video_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_video` (`video_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `task_submissions`
--
ALTER TABLE `task_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `videos`
--
ALTER TABLE `videos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `video_progress`
--
ALTER TABLE `video_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_4` FOREIGN KEY (`video_id`) REFERENCES `courses` (`id`);

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `modules`
--
ALTER TABLE `modules`
  ADD CONSTRAINT `modules_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Constraints for table `task_submissions`
--
ALTER TABLE `task_submissions`
  ADD CONSTRAINT `task_submissions_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `videos`
--
ALTER TABLE `videos`
  ADD CONSTRAINT `videos_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `video_progress`
--
ALTER TABLE `video_progress`
  ADD CONSTRAINT `video_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `video_progress_ibfk_2` FOREIGN KEY (`video_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
