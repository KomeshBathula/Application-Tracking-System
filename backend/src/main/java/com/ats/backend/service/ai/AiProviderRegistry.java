package com.ats.backend.service.ai;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AiProviderRegistry {

    private final Map<String, AiScreeningProvider> providers;

    public AiProviderRegistry(List<AiScreeningProvider> providerList) {
        this.providers = providerList.stream()
                .collect(Collectors.toMap(
                        p -> p.getProviderName().toUpperCase(),
                        Function.identity()
                ));
    }

    public AiScreeningProvider getProvider(String providerName) {
        if (providerName == null) {
            throw new IllegalArgumentException("AI provider name cannot be null");
        }
        AiScreeningProvider provider = providers.get(providerName.toUpperCase());
        if (provider == null) {
            throw new IllegalArgumentException("Unsupported AI provider: " + providerName + ". Available: " + providers.keySet());
        }
        return provider;
    }
}
