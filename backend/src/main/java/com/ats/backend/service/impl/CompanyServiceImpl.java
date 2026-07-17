package com.ats.backend.service.impl;

import com.ats.backend.entity.Company;
import com.ats.backend.exception.ResourceNotFoundException;
import com.ats.backend.repository.CompanyRepository;
import com.ats.backend.service.CompanyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyServiceImpl(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Override
    @Transactional
    public Company createCompany(Company company) {
        if (companyRepository.findByName(company.getName()).isPresent()) {
            throw new IllegalArgumentException("Company with name " + company.getName() + " already exists.");
        }
        return companyRepository.save(company);
    }

    @Override
    @Transactional
    public Company updateCompany(Long id, Company companyDetails) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        company.setName(companyDetails.getName());
        company.setDomain(companyDetails.getDomain());
        company.setHiringPreferences(companyDetails.getHiringPreferences());
        return companyRepository.save(company);
    }

    @Override
    @Transactional(readOnly = true)
    public Company getCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        companyRepository.delete(company);
    }
}
