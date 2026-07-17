package com.ats.backend.service;

import com.ats.backend.entity.Company;
import java.util.List;

public interface CompanyService {
    Company createCompany(Company company);
    Company updateCompany(Long id, Company companyDetails);
    Company getCompanyById(Long id);
    List<Company> getAllCompanies();
    void deleteCompany(Long id);
}
