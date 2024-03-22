The Data Import and Integration Script automates the process of importing data from multiple sources, including CSV files, Excel files, and databases. It integrates the imported data into a single dataset for further analysis and processing.

## Requirements:

- R programming environment installed (version 3.5 or higher)
- Required R packages: `readr`, `readxl`, `DBI`, `RSQLite`, `RODBC`, `odbc`

## Usage:

1. **Install Required Packages:**

   Before using the script, ensure that the required R packages are installed. You can install them using the following commands:

   ```R
   install.packages(c("readr", "readxl", "DBI", "RSQLite", "RODBC", "odbc"))
   ```

2. **Prepare Data Sources:**

   Prepare the data sources that you want to import into the script. This includes:

   - CSV files: Specify the file paths for each CSV file.
   - Excel files: Specify the file path and sheet name for the Excel file.
   - Databases: Define the connection string and query for accessing data from databases.

3. **Customize Script Parameters:**

   Open the script file (`data_import_integration_script.R`) in your preferred text editor or R environment.

   - Update the file paths and connection strings in the script according to your data sources and environment.

4. **Run the Script:**

   Execute the script in your R environment. The script will:

   - Import data from CSV files specified in the script.
   - Import data from the specified Excel file and sheet.
   - Retrieve data from the specified database using the provided connection string and query.
   - Combine all imported datasets into a single dataset.
   - Save the final dataset to a CSV file named "final_dataset.csv" in the current working directory.

5. **Review Output:**

   After running the script, review the generated "final_dataset.csv" file in the current working directory. This file contains the integrated dataset ready for further analysis.
