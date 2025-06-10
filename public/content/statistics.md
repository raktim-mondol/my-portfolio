### **Raktim Mondol: A Portfolio of Applied Statistical Methods**

This portfolio highlights Raktim Mondol's expertise in applying sophisticated statistical methods to solve complex problems in biomedical research, as demonstrated through his key publications.

---

#### **Anemia Detection System (2014)**

This project showcases the application of regression modeling for developing a non-invasive medical device.

*   **Statistical Method:** **Multivariate Regression Analysis**.
*   **Application & Findings:** A regression-based image processing method was employed to estimate hemoglobin (Hb) levels from non-invasive fingertip images. Using NCSS software, a multivariate regression model was developed that incorporated RGB color differences and nonlinear terms to establish a predictive relationship between blood color features and Hb concentration. The resulting statistical model successfully correlated with actual Hb levels, demonstrating that it could effectively predict hemoglobin concentration and was suitable for hardware implementation on an FPGA for rapid, non-invasive anemia screening.

---

#### **AFExNet: Differentiating Breast Cancer Sub-types (2021)**

This research demonstrates rigorous hypothesis testing to validate the superiority of a novel machine learning architecture for genomic data analysis.

*   **Statistical Method:** **Hypothesis Testing (Paired and One-Tailed T-tests)** 
*   **Application & Findings:** Paired t-tests were used to statistically compare the performance of the AFExNet feature extraction method against other techniques like PCA, VAE, and DAE. The tests evaluated the significance of differences in key classification metrics (precision, recall, accuracy, F1-score). The results confirmed that AFExNet's performance improvements were statistically significant, with p-values less than 0.10 (e.g., p=0.00793 vs. VAE). This rigorous statistical validation confirmed the robustness and superiority of the AFExNet model for analyzing high-dimensional genomic data.

---

#### **hist2RNA: Predicting Gene Expression from Histopathology (2023)**

This paper highlights a comprehensive application of survival, regression, and comparative statistics to validate a deep learning model.

*   **Statistical Methods:** **Survival Analysis (Kaplan-Meier, Cox Models)**, **Regression/Correlation Analysis (Spearman, R²)**, and **Comparative Analysis (t-tests, ANOVA)**.
*   **Application & Findings:** A full suite of survival analysis techniques was conducted. Kaplan-Meier estimation and log-rank tests were used to visualize and compare survival distributions between patient groups. Both univariate and multivariate Cox proportional hazards models were employed to identify significant prognostic markers and quantify their risk using hazard ratios. To validate the deep learning model's predictions, Spearman rank correlation and the coefficient of determination (R²) were used to measure the association between predicted and actual gene expression. T-tests and ANOVA were also applied to compare biomarker expressions across different tumor subgroups, demonstrating a versatile command of hypothesis testing.

---

#### **BioFusionNet: Survival Risk Stratification (2024)**

This work demonstrates an innovative approach to biostatistics by developing a novel statistical function to address common challenges in survival studies.

*   **Statistical Method:** **Advanced Survival Analysis** and **Custom Statistical Model Development**.
*   **Application & Findings:** The core contribution was the development of a **novel weighted Cox loss function**, specifically designed to handle the prevalent issue of imbalanced data in survival analysis. This was integrated into a multimodal deep learning framework. The effectiveness of this approach was validated using multivariate Cox proportional hazards models, which evaluated multiple risk factors simultaneously. The model achieved a high mean concordance index (C-index) of 0.77, underscoring a sophisticated capability to design, develop, and validate complex statistical models for high-accuracy patient risk stratification.
