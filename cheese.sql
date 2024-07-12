CREATE TABLE IF NOT EXISTS `cheeseDB`.`cheese` (
  `id` INT NOT NULL,
  `name` VARCHAR(100) NULL,
  `ingredients` VARCHAR(200) NULL,
  `country` VARCHAR(100) NULL,
  `type` VARCHAR(100) NULL,
  `texture` VARCHAR(100) NULL,
  `rind` VARCHAR(100) NULL,
  `colour` VARCHAR(100) NULL,
  `flavour` VARCHAR(100) NULL,
  `aroma` VARCHAR(100) NULL,
  `synonyms` VARCHAR(100) NULL,
  `isVegetarian` TINYINT NULL,
  `isVegan` TINYINT NULL,
  `family` VARCHAR(100) NULL,
  `region` VARCHAR(300) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE)
ENGINE = InnoDB