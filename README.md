## Streamlining the process of importing and combining data from multiple sources

This repository contains a comprehensive R script that automates the process of importing data from various sources (CSV files, Excel files, databases) and integrates them into a single dataset. The script utilizes packages such as `readr` for reading CSV files, `readxl` for reading Excel files, and `DBI` along with appropriate database-specific packages for database interactions. You may need to install these packages if you haven't already.

## How to Use
1. **Installation**: Ensure that you have installed the necessary R packages listed at the beginning of the script. You can install them using the following command:
   ```
   install.packages(c("readr", "readxl", "DBI", "RSQLite", "RODBC", "DBI", "odbc"))
   ```

2. **Customize Data Sources**: Update the file paths, sheet names, connection strings, and queries in the script according to your specific data sources. Ensure that the paths and connection strings point to the correct locations of your CSV files, Excel spreadsheets, and databases.

3. **Run the Script**: Execute the script in your R environment. You can do this by copying and pasting the script into an R script editor or running it line by line in the R console.

4. **Review the Results**: Once the script has been executed successfully, the final dataset will be saved as `final_dataset.csv` in your working directory. Additionally, summary statistics of the final dataset will be printed for your review, providing insights into the data's structure and characteristics.
