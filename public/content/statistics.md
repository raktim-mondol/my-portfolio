### **Raktim Mondol: A Portfolio of Applied Statistical Methods (Biostatistics)**

This portfolio highlights Raktim Mondol's expertise in applying sophisticated statistical methods to solve complex problems in biomedical research, as demonstrated through his key publications.

---
## **1. BioFusionNet: Survival Risk Stratification IEEE JBHI 2024 **

This work demonstrates an innovative approach to biostatistics by developing a novel statistical function to address common challenges in survival studies.

*   **Statistical Method:** **Advanced Survival Analysis** and **Custom Statistical Model Development**.
*   **Application & Findings:** The core contribution was the development of a **novel weighted Cox loss function**, specifically designed to handle the prevalent issue of imbalanced data in survival analysis. This was integrated into a multimodal deep learning framework. The effectiveness of this approach was validated using multivariate Cox proportional hazards models, which evaluated multiple risk factors simultaneously. The model achieved a high mean concordance index (C-index) of 0.77, underscoring a sophisticated capability to design, develop, and validate complex statistical models for high-accuracy patient risk stratification.

| Statistical method | Why used / implication | Technical depth | Key results |
|---|---|---|---|
| **Weighted Cox loss** (novel) | Custom loss to up-weight rare death events during deep-net training. | Implements instance-level weighting inside mini-batch; balances censoring. | Outperformed classic Cox loss: C-index↑ from 0.67 → 0.77 (mean over 5 folds). |
| **Concordance index (C-index)** | Primary metric for patient-level risk ranking. | Survival-analysis staple; here averaged over 5-fold CV. | Mean C-index = 0.77 ± 0.05. |
| **Time-dependent AUC** | Evaluates discrimination at multiple horizons (0–10 y). | Integrates cumulative/dynamic ROC; more demanding than simple AUC. | Mean AUC = 0.84 ± 0.05. |
| **Univariate & multivariate Cox models** | Compare BioFusionNet risk groups to standard clinico-path variables. | Same framework as hist2RNA but with weighting. | Univariate HR = 2.99 (1.88–4.78); multivariate HR = 2.91 (1.80–4.68); both p < 0.005. |
| **Kaplan–Meier & log-rank** | Visual confirmation of high- vs low-risk separation. | Standard survival plotting. | Log-rank p = 6.45 × 10⁻⁷. |
| **Five-fold stratified cross-validation** | Robust estimate of generalisation; preserves event ratio. | Good ML practice. | Fold C-indices: 0.72–0.82. |
| **Paired model benchmarking** | Compared C-index / AUC vs six multimodal baselines. | Uses identical Optuna-tuned hyper-parms for fair test. | BioFusionNet best by ≥ 0.07 C-index. |
---

## **2. hist2RNA: Predicting Gene Expression from Histopathology (2023) *Cancers* 2023**

This paper highlights a comprehensive application of survival, regression, and comparative statistics to validate a deep learning model.

*   **Statistical Methods:** **Survival Analysis (Kaplan-Meier, Cox Models)**, **Regression/Correlation Analysis (Spearman, R²)**, and **Comparative Analysis (t-tests, ANOVA)**.
*   **Application & Findings:** A full suite of survival analysis techniques was conducted. Kaplan-Meier estimation and log-rank tests were used to visualize and compare survival distributions between patient groups. Both univariate and multivariate Cox proportional hazards models were employed to identify significant prognostic markers and quantify their risk using hazard ratios. To validate the deep learning model's predictions, Spearman rank correlation and the coefficient of determination (R²) were used to measure the association between predicted and actual gene expression. T-tests and ANOVA were also applied to compare biomarker expressions across different tumor subgroups, demonstrating a versatile command of hypothesis testing.

| Statistical method | Why used / implication | Technical depth | Key results |
|---|---|---|---|
| **Spearman rank correlation (ρ)** with Benjamini-Hochberg **FDR** adjustment | Quantify how well predicted vs. true gene-expression ranks agree; FDR guards against 138 parallel tests. | Non-parametric; multiple-testing control. | Across patients: median ρ = 0.82 (p = 4.3 × 10⁻⁶⁴). Across genes: median ρ = 0.29 with 105/138 genes significant at 5 % FDR. |
| **Coefficient of determination (R²)** | Measures variance explained by the model for each gene. | Classical regression statistic. | 32 genes had R² ≥ 0.10; 17 belong to PAM50 set. |
| **Two-sample t-tests** | Compare predicted gene expression between IHC-positive vs. IHC-negative tumours (ER, PR, HER2). | Parametric difference-of-means; assumes normality. | e.g., ESR1 t-test p = 4.2 × 10⁻⁵⁴ (ER⁺ vs ER⁻). |
| **One-way ANOVA** | Assess trends in predicted MKI67 across tumour grades 1–3. | Parametric multi-group comparison. | MKI67 ANOVA p = 9.9 × 10⁻⁹. |
| **Concordance index (c-index)** | Rank-based discrimination for survival predictions. | Survival-analysis metric independent of time scale. | c-index = 0.56 (univariate) improved to 0.65 in multivariate Cox model. |
| **Cox proportional-hazards (univariate & multivariate)** with **hazard ratio (HR ± 95 % CI)** | Test whether hist2RNA-derived luminal subtype is prognostic after adjusting for clinicopathology. | Semi-parametric survival model. | HR = 2.16 (1.12–3.06) univariate; HR = 1.87 (1.30–2.68) multivariate; p < 5 × 10⁻³. |
| **Log-rank test & Kaplan–Meier curves** | Visual and inferential check of survival separation between predicted LumA vs LumB. | Non-parametric time-to-event comparison. | Log-rank p < 5 × 10⁻³; clear survival divergence. |

---

#### **AFExNet: Differentiating Breast Cancer Sub-types (2021)**

This research demonstrates rigorous hypothesis testing to validate the superiority of a novel machine learning architecture for genomic data analysis.

*   **Statistical Method:** **Hypothesis Testing (Paired and One-Tailed T-tests)** 
*   **Application & Findings:** Paired t-tests were used to statistically compare the performance of the AFExNet feature extraction method against other techniques like PCA, VAE, and DAE. The tests evaluated the significance of differences in key classification metrics (precision, recall, accuracy, F1-score). The results confirmed that AFExNet's performance improvements were statistically significant, with p-values less than 0.10 (e.g., p=0.00793 vs. VAE). This rigorous statistical validation confirmed the robustness and superiority of the AFExNet model for analyzing high-dimensional genomic data.

## 3. AFExNet – *IEEE/ACM TCBB* 2021

| Statistical method | Why used / implication | Technical depth | Key results |
|---|---|---|---|
| **One-tail paired Student t-tests** | Show that AFExNet’s precision/recall gains vs. PCA, AE, VAE, DAE are not by chance. | Parametric paired design; reports t & p for four method comparisons. | Example: vs. PCA t = 1.92, p = 0.047 (precision); vs. VAE t = 2.85, p = 0.0079. |
| **Cross-validation (5-fold)** | Stability check of all 12 classifiers across metrics. | Standard ML validation. | Precision up to 85.9 %, recall 85.8 % with SVM. |
| **Confusion-matrix–derived metrics** – accuracy, precision, recall, F1, MCC, Cohen’s κ, ROC-AUC | Multi-faceted performance portrait across imbalanced classes. | Mix of parametric & rank-based indices. | MCC 0.70 with voting classifier; AUC 0.84 with SVM. |
| **GO-term & KEGG pathway enrichment (DAVID)** with corrected p-values | Biological validation of genes extracted via latent-weight analysis. | Multiple-testing correction inside DAVID; p-value interpretation. | Top GO term “olfactory receptor activity”, p = 5.92 × 10⁻²; pathway “olfactory transduction”, p = 5.23 × 10⁻². |
| **SMOTE sampling** | Synthetic oversampling to counter class imbalance before training. | Resampling technique; not an inferential test but key pre-processing step. | Balanced minority classes without inflating Type I error downstream. |
---

#### **Anemia Detection System (2014)**

This project showcases the application of regression modeling for developing a non-invasive medical device.

*   **Statistical Method:** **Multivariate Regression Analysis**.
*   **Application & Findings:** A regression-based image processing method was employed to estimate hemoglobin (Hb) levels from non-invasive fingertip images. Using NCSS software, a multivariate regression model was developed that incorporated RGB color differences and nonlinear terms to establish a predictive relationship between blood color features and Hb concentration. The resulting statistical model successfully correlated with actual Hb levels, demonstrating that it could effectively predict hemoglobin concentration and was suitable for hardware implementation on an FPGA for rapid, non-invasive anemia screening.
## 4. Hardware Architecture Design of Anemia Detecting Regression Model (2014) 

| Statistical method | Why used / implication | Technical depth | Key results |
|---|---|---|---|
| **Multivariate polynomial regression** (quadratic & interaction terms) forming a **ratio model**: Hb = *N<sub>r</sub>/D<sub>r</sub>* | Maps colour-change features (ΔR, ΔG, ΔB) from fingertip images to haemoglobin level, enabling a fully non-invasive test. | • 9 predictors + constant per numerator/denominator (Eqs 4–6).<br>• Fitted with NCSS; coefficients quantised to IEEE-754 for FPGA. | Closed-form eq. exactly given in paper :contentReference[oaicite:1]{index=1}. |
| **Hardware/MATLAB parity test** | Verifies that floating-point RTL reproduces regression output *bit-for-bit* → builds trust in deployment. | Table III compares 5 pixel samples (R₁,G₁,B₁ …) through pipeline. | Hb error = **0** for all samples (e.g. 8.5692 g/dL in both MATLAB & Verilog) :contentReference[oaicite:2]{index=2}. |
| **Threshold rule (≤ 10 g/dL)** | Converts continuous Hb to binary “anemic / normal” output for clinical screening. | Simple comparator inside FPGA; threshold from WHO ranges :contentReference[oaicite:3]{index=3}. | Device toggles 1-bit flag when Hb ≤ 10 g/dL (figure shows 7-segment display). |

## 5. FPGA-Based Leaf Chlorophyll Estimating Regression Model (2014)

| Statistical method | Why used / implication | Technical depth | Key results |
|---|---|---|---|
| **Stepwise multivariate linear regression with nonlinear terms** | Finds the lightest model that still predicts chlorophyll (Ch) from RGB + normalised channels; ideal for resource-limited FPGA. | • Starts with R,G,B,N1,N2; iteratively adds R², G², B², GB, RB until Adj-R² drops.<br>• Terms with poor p-value (G×R, N3) removed. | Final Eq 5 yields **R² = 0.99, Adj-R² = 0.99, RMSE = 3.32**, *p* = 3.14×10⁻⁷, F ≈ 6.18×10¹² (15 samples, EDF = 5) |
| **Hougen nonlinear regression (P/Q form)** | Benchmarks whether a chemical-kinetics-style ratio boosts accuracy. | 5 free coefficients; fitted by non-linear least squares. | R² = 0.91, RMSE = 5.75 – inferior to stepwise model, so not implemented |
| **Model-diagnostic plots** (normal probability, residuals vs fit, lagged residuals) | Confirms homoscedastic, un-autocorrelated errors → validates linear assumptions before hardware port. | Figures 2–5 in the paper show tight residual cloud within 0.5 σ  |
| **Comparative metrics table** (14 simpler fits) | Quantifies trade-offs so designers can justify chosen complexity. | Table I lists R², RMSE, F, EDF for each candidate model. | Stepwise model dominates all baselines (next-best linear RGB has R² = 0.88) |
---

## Raktim’s biostatistics portfolio  

| Capability demonstrated | Evidence from papers |
|---|---|
| **Modern survival analysis** (Cox PH, c-index, weighted loss, K-M, log-rank) | hist2RNA & BioFusionNet show classical and deep-learning-specific implementations. |
| **Comparative hypothesis testing** (t-test, ANOVA, paired design) | hist2RNA uses group t-tests & ANOVA; AFExNet runs paired t-tests against baselines. |
| **Correlation & multiple-testing control** | Spearman + FDR across 138 genes in hist2RNA. |
| **Model-evaluation under class imbalance** | AFExNet employs SMOTE and reports MCC, κ; BioFusionNet designs weighted loss. |
| **Omics feature validation** (GO / pathway enrichment) | AFExNet links latent-space genes to olfactory-transduction pathway. |
| **Rigorous cross-validation & benchmarking** | 5-fold experiments compare up to 12 classifiers (AFExNet) and 6 fusion baselines (BioFusionNet). |
| **Design & validation of polynomial and ratio regressions** | Anemia paper’s Hb = *N*⁄*D* quadratic model ported to FPGA with bit-exact MATLAB parity  |
| **Model-selection & residual diagnostics for linear/non-linear regression** | Stepwise search, Hougen non-linear comparison, and residual plots in chlorophyll paper  |
| **Goodness-of-fit metric reporting (R², Adj-R², RMSE, F, p)** | Chlorophyll study publishes a 14-model table with full metrics to justify choice :contentReference[oaicite:0]{index=0} |
| **Hardware-level verification of statistical models** | FPGA RTL vs MATLAB parity test confirms fixed-point implementation accuracy for Hb regression :contentReference[oaicite:1]{index=1} |
| **Threshold-based clinical/agronomic decision rules** | 10 g/dL anemia flag and chlorophyll thresholds hard-wired in FPGA logic  |


**In short:** Raktim’s work covers the full biostatistical spectrum—from classic parametric tests and survival modelling to modern cross-validated machine-learning metrics and enrichment analyses—illustrating both theoretical command and practical execution in large-scale omics studies.




